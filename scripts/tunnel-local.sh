#!/usr/bin/env bash
set -eu -o pipefail

# One-command tunneled local dev: exposes local Supabase (54321) + Expo via tunnel.
# Keeps `local` for dev even across networks; hosted stays for preview/prod.
# Usage: TUNNEL=1 make dev  (or ./scripts/tunnel-local.sh directly)
# Requires: ngrok (with authtoken) or cloudflared; Expo will still use --tunnel for Metro.

PORT=54321
NGROK_API="http://127.0.0.1:4040/api/tunnels"
TMP_LOG="$(mktemp /tmp/tunnel-local-XXXXXX.log)"
NGROK_PID=""
CLOUDFLARED_PID=""

cleanup() {
  if [[ -n "${NGROK_PID:-}" ]] && kill -0 "$NGROK_PID" 2>/dev/null; then
    kill "$NGROK_PID" 2>/dev/null || true
  fi
  if [[ -n "${CLOUDFLARED_PID:-}" ]] && kill -0 "$CLOUDFLARED_PID" 2>/dev/null; then
    kill "$CLOUDFLARED_PID" 2>/dev/null || true
  fi
  rm -f "$TMP_LOG"
}
trap cleanup EXIT INT TERM

# 1) Get local ANON key (needed for Expo env) without needing LAN IP.
if ! _local_status="$(npx supabase status --output env 2>/dev/null)"; then
  echo "Unable to read local Supabase status. Run: make supabase-start" >&2
  exit 1
fi
_anon_key="$(printf '%s\n' "$_local_status" | sed -n 's/^ANON_KEY=//p' | tr -d '"' | tr -d "'")"
_pub_key="$(printf '%s\n' "$_local_status" | sed -n 's/^PUBLISHABLE_KEY=//p' | tr -d '"' | tr -d "'")"
if [[ -z "$_anon_key" && -n "$_pub_key" ]]; then
  _anon_key="$_pub_key"
fi
if [[ -z "$_anon_key" ]]; then
  echo "Local Supabase status is missing ANON_KEY." >&2
  exit 1
fi

# If caller already set TUNNELED_SUPABASE_URL, just use it (manual override).
if [[ -n "${TUNNELED_SUPABASE_URL:-}" ]]; then
  if [[ ! "$TUNNELED_SUPABASE_URL" =~ ^https?:// ]]; then
    echo "TUNNELED_SUPABASE_URL must start with http:// or https:// (got: $TUNNELED_SUPABASE_URL)" >&2
    exit 1
  fi
  _tunneled_url="$TUNNELED_SUPABASE_URL"
  echo "Local Supabase (tunneled, manual): $_tunneled_url"
  echo "Expo tunnel mode — phone can be on different network (hosted stays for preview/prod)"
  EXPO_PUBLIC_SUPABASE_URL="$_tunneled_url" EXPO_PUBLIC_SUPABASE_ANON_KEY="$_anon_key" EXPO_PUBLIC_APP_ENV=development EXPO_NO_DOTENV=1 APP_VARIANT=development npx expo start --dev-client --tunnel
  exit 0
fi

# 2) Try ngrok first.
_tunneled_url=""
if command -v ngrok >/dev/null 2>&1; then
  echo "Starting ngrok http $PORT ..."
  # ngrok http in background; API on 4040
  ngrok http "$PORT" --log stdout --log-format json >"$TMP_LOG" 2>&1 &
  NGROK_PID=$!
  # Wait for API
  for _ in $(seq 1 15); do
    if curl -s "$NGROK_API" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  if curl -s "$NGROK_API" >/dev/null 2>&1; then
    _tunneled_url="$(curl -s "$NGROK_API" | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -n1)"
  fi
  if [[ -z "$_tunneled_url" ]]; then
    echo "ngrok started but no https URL yet. Check ngrok authtoken: ngrok config add-authtoken <token>" >&2
    echo "Log: $TMP_LOG" >&2
    # Try to show ngrok log tail
    tail -n 20 "$TMP_LOG" >&2 || true
    # Fall through to cloudflared fallback if available
    if [[ -n "$NGROK_PID" ]]; then
      kill "$NGROK_PID" 2>/dev/null || true
      NGROK_PID=""
    fi
    _tunneled_url=""
  else
    echo "Local Supabase (tunneled, ngrok): $_tunneled_url"
  fi
fi

# 3) Fallback to cloudflared trycloudflare if ngrok unavailable/failed.
if [[ -z "$_tunneled_url" ]] && command -v cloudflared >/dev/null 2>&1; then
  echo "Starting cloudflared tunnel http://localhost:$PORT ..."
  cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate >"$TMP_LOG" 2>&1 &
  CLOUDFLARED_PID=$!
  # cloudflared prints https://xxx.trycloudflare.com to stderr/log; poll it
  for _ in $(seq 1 20); do
    if grep -q "https://.*trycloudflare.com" "$TMP_LOG" 2>/dev/null; then
      break
    fi
    sleep 1
  done
  _tunneled_url="$(grep -o 'https://[^ ]*trycloudflare.com[^ ]*' "$TMP_LOG" | head -n1 | tr -d '\"' | tr -d "'")"
  if [[ -n "$_tunneled_url" ]]; then
    # Ensure https
    _tunneled_url="${_tunneled_url%%\"*}"
    echo "Local Supabase (tunneled, cloudflared): $_tunneled_url"
  fi
fi

if [[ -z "$_tunneled_url" ]]; then
  echo "Failed to create tunnel. Install ngrok (ngrok config add-authtoken ...) or cloudflared, or run manually:" >&2
  echo "  ngrok http $PORT" >&2
  echo "  TUNNELED_SUPABASE_URL=https://xxx.ngrok-free.app make dev" >&2
  exit 1
fi

echo "Expo tunnel mode — phone can be on different network (hosted stays for preview/prod)"
# 4) Start Expo with tunneled URL (blocking, cleanup on Ctrl+C via trap)
EXPO_PUBLIC_SUPABASE_URL="$_tunneled_url" EXPO_PUBLIC_SUPABASE_ANON_KEY="$_anon_key" EXPO_PUBLIC_APP_ENV=development EXPO_NO_DOTENV=1 APP_VARIANT=development npx expo start --dev-client --tunnel
