.DEFAULT_GOAL := help

SHELL := /usr/bin/env bash
.SHELLFLAGS := -eu -o pipefail -c

EXPO := npx expo
EAS := npx eas-cli
SUPABASE := npx supabase
LOCAL_ENV := . ./scripts/local-supabase-env.sh loopback admin;

.PHONY: help setup dev dev-lan dev-loopback devbuild preview production
.PHONY: supabase-start supabase-stop supabase-status
.PHONY: db-reset db-reset-clean db-seed db-clear db-types db-diff migration db-push
.PHONY: typecheck lint format format-check test build check

help: ## Show all commands
	@awk 'BEGIN {FS = ":.*## "} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)} \
		/^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

##@ Setup

setup: ## Install npm dependencies
	npm install

##@ Development

dev: dev-lan ## Start local Supabase and Expo for a physical device

dev-lan: supabase-start ## Start Expo with the local Supabase LAN address
	@. ./scripts/local-supabase-env.sh lan app; \
		printf 'Local Supabase: %s\n' "$$EXPO_PUBLIC_SUPABASE_URL"; \
		EXPO_NO_DOTENV=1 APP_VARIANT=development $(EXPO) start --dev-client --lan

dev-loopback: supabase-start ## Start Expo with the local Supabase loopback address
	@. ./scripts/local-supabase-env.sh loopback app; \
		EXPO_NO_DOTENV=1 APP_VARIANT=development $(EXPO) start --dev-client

devbuild: ## Build the development APK (rebuild only after native/config changes)
	$(EAS) build --platform android --profile development --non-interactive

preview: ## Build the internally distributed preview APK
	$(EAS) build --platform android --profile preview --non-interactive

production: ## Build the production APK
	$(EAS) build --platform android --profile production --non-interactive

##@ Local Supabase

supabase-start: ## Start the local Supabase stack and apply migrations
	$(SUPABASE) start

supabase-stop: ## Stop the local Supabase stack
	$(SUPABASE) stop

supabase-status: ## Show local Supabase endpoints and status
	$(SUPABASE) status

##@ Database

db-reset: supabase-start ## Reset the local DB, apply migrations, and seed demo data
	$(SUPABASE) db reset --local --no-seed
	@$(LOCAL_ENV) node scripts/seed.cjs

db-reset-clean: supabase-start ## Reset the local DB without demo data
	$(SUPABASE) db reset --local --no-seed

db-seed: supabase-start ## Idempotently seed demo users and data into the local DB
	@$(LOCAL_ENV) node scripts/seed.cjs

db-clear: supabase-start ## Clear local operational/catalog data but keep user accounts
	@$(LOCAL_ENV) psql "$$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
		'truncate table transaction_items, transactions, stock_movements, inventory, product, category restart identity cascade;'

db-types: ## Regenerate TypeScript database types from the local schema
	@mkdir -p src/types
	@temp_file=$$(mktemp src/types/.database.types.ts.XXXXXX); \
		trap 'rm -f "$$temp_file"' EXIT; \
		$(SUPABASE) gen types typescript --local > "$$temp_file"; \
		mv "$$temp_file" src/types/database.types.ts; \
		trap - EXIT

db-diff migration: export MIGRATION_NAME := $(value name)

db-diff: ## Create a local schema diff (name required)
	@migration_name="$${MIGRATION_NAME-}"; \
		if [[ ! "$$migration_name" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$$ ]]; then \
			printf 'Usage: make db-diff name=<migration-name>\n' >&2; \
			exit 2; \
		fi; \
		$(SUPABASE) db diff --local --file "$$migration_name"

migration: ## Create an empty migration (name required)
	@migration_name="$${MIGRATION_NAME-}"; \
		if [[ ! "$$migration_name" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$$ ]]; then \
			printf 'Usage: make migration name=<migration-name>\n' >&2; \
			exit 2; \
		fi; \
		$(SUPABASE) migration new "$$migration_name"

db-push: ## Push migrations to the intentionally linked hosted project
	@printf 'This pushes to the currently linked hosted Supabase project.\n'
	@read -r -p 'Type PUSH to continue: ' confirmation; \
		[[ "$$confirmation" == 'PUSH' ]] || { printf 'Aborted.\n'; exit 1; }; \
		$(SUPABASE) db push --linked

##@ Quality

typecheck: ## Type-check the project
	npm run typecheck

lint: ## Run ESLint
	npm run lint

format: ## Format the codebase
	npm run format

format-check: ## Verify formatting
	npm run format:check

test: ## Run tests
	npm run test

build: ## Verify the Android Metro bundle
	npm run build

check: typecheck lint format-check test build ## Run all local quality gates
