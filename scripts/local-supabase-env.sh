#!/usr/bin/env bash

# Source this file from a Make recipe. It maps the local Supabase CLI output to
# the names consumed by Expo and, for seed commands, to server-only variables.

_local_network_mode="${1:-loopback}"
_local_scope="${2:-app}"

_local_fail() {
  printf '%s\n' "$1" >&2
  unset -f _local_fail
  return 1 2>/dev/null || exit 1
}

_local_status="$(npx supabase status --output env 2>/dev/null)" ||
  _local_fail 'Unable to read local Supabase status. Run make supabase-start first.'

_local_api_url=
_local_anon_key=
_local_db_url=
_local_service_role_key=

_local_unquote() {
  local value="$1"
  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"
  printf '%s' "$value"
}

while IFS= read -r _local_line || [[ -n "$_local_line" ]]; do
  case "$_local_line" in
    API_URL=*) _local_api_url="$(_local_unquote "${_local_line#*=}")" ;;
    ANON_KEY=*) _local_anon_key="$(_local_unquote "${_local_line#*=}")" ;;
    PUBLISHABLE_KEY=*)
      if [[ -z "$_local_anon_key" ]]; then
        _local_anon_key="$(_local_unquote "${_local_line#*=}")"
      fi
      ;;
    DB_URL=*) _local_db_url="$(_local_unquote "${_local_line#*=}")" ;;
    SERVICE_ROLE_KEY=*)
      _local_service_role_key="$(_local_unquote "${_local_line#*=}")"
      ;;
  esac
done <<< "$_local_status"

if [[ -z "$_local_api_url" || -z "$_local_anon_key" ]]; then
  _local_fail 'Local Supabase status is missing API_URL or ANON_KEY.'
fi

# Tunnel override: if TUNNELED_SUPABASE_URL is set, use it directly so the
# local DB can be reached from a different network (ngrok http 54321).
# This keeps `local` for dev even across networks; hosted stays for preview/prod.
if [[ -n "${TUNNELED_SUPABASE_URL:-}" ]]; then
  if [[ ! "$TUNNELED_SUPABASE_URL" =~ ^https?:// ]]; then
    _local_fail "TUNNELED_SUPABASE_URL must start with http:// or https:// (got: $TUNNELED_SUPABASE_URL)"
  fi
  _local_api_url="$TUNNELED_SUPABASE_URL"
elif [[ "$_local_network_mode" == "lan" ]]; then
  _local_lan_ip="${LAN_IP:-}"
  if [[ -z "$_local_lan_ip" ]] && command -v ip >/dev/null 2>&1; then
    _local_lan_ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "src") {print $(i + 1); exit}}')"
  fi
  if [[ -z "$_local_lan_ip" ]]; then
    _local_fail 'Unable to detect a LAN IP. Retry with: make dev-lan LAN_IP=192.168.x.x'
  fi
  _local_api_url="${_local_api_url/127.0.0.1/$_local_lan_ip}"
  _local_api_url="${_local_api_url/localhost/$_local_lan_ip}"
elif [[ "$_local_network_mode" == "tunnel" ]]; then
  _local_fail "Tunnel mode requires TUNNELED_SUPABASE_URL. Run: ngrok http 54321 then TUNNELED_SUPABASE_URL=https://xxx.ngrok-free.app make dev"
elif [[ "$_local_network_mode" != "loopback" ]]; then
  _local_fail "Unknown network mode: $_local_network_mode"
fi

export EXPO_PUBLIC_SUPABASE_URL="$_local_api_url"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="$_local_anon_key"
export EXPO_PUBLIC_APP_ENV=development

if [[ "$_local_scope" == "admin" ]]; then
  if [[ -z "$_local_db_url" || -z "$_local_service_role_key" ]]; then
    _local_fail 'Local Supabase status is missing DB_URL or SERVICE_ROLE_KEY.'
  fi
  export DATABASE_URL="$_local_db_url"
  export SUPABASE_URL="$_local_api_url"
  export SUPABASE_SERVICE_ROLE_KEY="$_local_service_role_key"
elif [[ "$_local_scope" != "app" ]]; then
  _local_fail "Unknown environment scope: $_local_scope"
else
  unset DATABASE_URL SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
fi

unset -f _local_fail _local_unquote
unset _local_network_mode _local_scope _local_status _local_line
unset _local_api_url _local_anon_key _local_db_url _local_service_role_key
unset _local_lan_ip
