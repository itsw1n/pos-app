# Makefile — IPSS (Cafe Elvira POS)
# Drives local development (Expo), DEV-only data seeding, and remote schema
# migrations via the Supabase CLI.
#
# Environment targets:
#   `make dev`      -> Expo dev server against .env.development (dev build / Fast Refresh)
#   `make prod`     -> Expo dev server against .env.production
#   `make devbuild` -> Build a custom development APK via EAS (requires expo-dev-client)
#
# Database:
#   DEV and PROD are BOTH remote Supabase projects. The Supabase CLI is linked
#   to whichever project you point it at via `supabase link`. `migrate-dev`
#   targets DEV; `migrate-prod` targets PROD. There is intentionally NO
#   local Docker database in this workflow — use the Supabase CLI against remote.
#
# Safety:
#   `make seed` seeds DEV data only and refuses to run against PROD.
#   `make reset-dev` re-applies ALL migrations (rebuilds the DEV schema from
#   local migrations) — destructive to DEV, guarded to refuse unless the DEV
#   project is linked, and does NOT seed. Run `make seed` separately.
#   There is NO `seed-prod`. PROD is never seeded.

EXPO := npx expo
EAS := npx eas-cli
NODE := node
SUPABASE := supabase

# DEV project reference (fixed; used to guard destructive reset-dev).
DEV_SUPABASE_REF := mhlmskbuifatnlehvodf
# The CLI writes the linked project ref here after `supabase link`.
LINKED_REF_FILE := supabase/.temp/project-ref

.PHONY: help setup dev devbuild prod preview seed reset-dev typecheck lint format format-check \
        build migrate-dev migrate-prod

help: ## Show available commands
	@echo "===== DEVELOPMENT ====="
	@printf "  %-12s %s\n" "make dev"      "Start Expo dev server (development env; connect via dev-build app)"
	@printf "  %-12s %s\n" "make prod"     "Start Expo using the production env"
	@printf "  %-12s %s\n" "make devbuild" "Build a custom development APK via EAS (install once, then Fast Refresh)"
	@printf "  %-12s %s\n" "make preview"  "Build a test APK (EAS preview; gives a QR/URL to install & test on your phone)"
	@printf "  %-12s %s\n" "make seed"     "Seed DEV database with demo data (data only; DEV-only)"
	@printf "  %-12s %s\n" "make reset-dev" "REBUILD the linked DEV DB from local migrations (destructive, DEV-only, no seed)"
	@printf "  %-12s %s\n" "make typecheck" "Type-check the project (npx tsc --noEmit)"
	@printf "  %-12s %s\n" "make lint"      "Lint with ESLint (npx expo lint)"
	@printf "  %-12s %s\n" "make format"   "Format codebase (prettier --write .)"
	@printf "  %-12s %s\n" "make format-check" "Verify formatting (prettier --check .)"
	@echo ""
	@echo "===== DATABASE / MIGRATIONS ====="
	@printf "  %-12s %s\n" "make migrate-dev"  "Apply migrations to DEV (supabase db push, linked project)"
	@printf "  %-12s %s\n" "make migrate-prod" "Apply migrations to PROD (supabase db push, linked project)"
	@echo ""
	@echo "===== DEPLOYMENT ====="
	@echo "  (no automated deployment targets in this repo)"

setup: ## Install npm dependencies
	npm install

dev: ## Start Expo dev server against the development build (Fast Refresh)
	NODE_ENV=development $(EXPO) start --dev-client

prod: ## Start Expo using the production environment
	NODE_ENV=production $(EXPO) start

devbuild: ## Build a custom development APK via EAS (install once, then Fast Refresh)
	@$(EAS) build --platform android --profile development --non-interactive
	@echo ""
	@echo "Dev APK is ready. Scan the QR / open the URL above on your phone, and"
	@echo "install it once. Then run 'make dev' and connect from the installed app."
	@echo "JS changes hot-reload (Fast Refresh); only native/config changes need a"
	@echo "rebuild (rerun 'make devbuild')."

preview: ## Build a test APK via EAS (preview profile; QR/URL to install on your phone)
	@bash -c 'set -a; . ./.env.production; set +a; $(EAS) build --platform android --profile preview --non-interactive'
	@echo ""
	@echo "APK is ready. Scan the QR or open the URL above on your phone to download"
	@echo "and install it. The build inlines EXPO_PUBLIC_* from .env.production."

seed: ## Seed DEV database with demo data ONLY (refuses PROD; assumes schema migrated)
	$(NODE) scripts/seed.cjs

# --- Destructive DEV reset (rebuild DEV schema from local migrations) ---------
# Resets the LINKED project, re-running ALL local migrations (0001-0004+).
# Guarded so it only runs when the linked project is the DEV project. It does
# NOT seed — use `make seed` afterwards if demo data is wanted.
reset-dev: ## Rebuild the linked DEV database from local migrations (destructive; DEV-only, no seed)
	@if [ ! -f "$(LINKED_REF_FILE)" ]; then \
	  echo "error: not linked to any Supabase project."; \
	  echo "       Run: supabase login && supabase link --project-ref $(DEV_SUPABASE_REF)"; \
	  exit 1; \
	fi; \
	LINKED_REF=$$(cat "$(LINKED_REF_FILE)"); \
	if [ "$$LINKED_REF" != "$(DEV_SUPABASE_REF)" ]; then \
	  echo "REFUSED: linked project is $$LINKED_REF, expected DEV $(DEV_SUPABASE_REF)."; \
	  echo "reset-dev only runs against the DEV project."; \
	  exit 1; \
	fi; \
	echo "WARNING: this REBUILDS the DEV database $(DEV_SUPABASE_REF) from local migrations (destructive)."; \
	read -r -p "Type DEV to confirm: " CONFIRM; \
	if [ "$$CONFIRM" != "DEV" ]; then \
	  echo "Aborted."; \
	  exit 1; \
	fi; \
	$(SUPABASE) db reset --linked

typecheck: ## Type-check the project
	npx tsc --noEmit

lint: ## Lint the project (ESLint via Expo)
	npx expo lint

format: ## Format the codebase with Prettier
	npx prettier --write .

format-check: ## Verify Prettier formatting
	npx prettier --check .

build: ## Produce a static export bundle (android; mobile-only app)
	npx expo export --platform android

# --- Remote migrations (DEV / PROD via the Supabase CLI) ---------------------
# Both operate on whatever remote project is currently linked (`supabase link`).
# Use these intentionally; there is no generic `migrate` shortcut so that
# DEV and PROD are never confused.
migrate-dev: ## Apply pending migrations to the linked DEV project
	$(SUPABASE) db push

migrate-prod: ## Apply pending migrations to the linked PROD project (controlled deployment)
	$(SUPABASE) db push
