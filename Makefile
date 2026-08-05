# Makefile — IPSS (Cafe Elvira)
# Drives the Supabase dev environment, seeding, builds, and Docker tooling.
# Requires: docker, docker compose, node, npm (or use the `docker-*` targets).

# --- Environment selection ---------------------------------------------------
# `make dev`     -> uses .env.development (NODE_ENV=development), seeds dev DB
# `make prod`    -> uses .env.production   (NODE_ENV=production)
# Secrets for seeding live in .env.local (never committed).

EXPO := npx expo
NODE := node

.PHONY: help setup dev prod seed reset typecheck build \
        docker-seed docker-reset docker-typecheck docker-build

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Install npm dependencies
	npm install

dev: ## Start Expo dev server (development env)
	NODE_ENV=development $(EXPO) start

prod: ## Start Expo using the production environment
	NODE_ENV=production $(EXPO) start

seed: ## Apply schema + upsert demo data into the configured database
	$(NODE) scripts/seed.cjs seed

reset: ## Drop + recreate schema, then seed demo data
	$(NODE) scripts/seed.cjs reset

typecheck: ## Type-check the project
	npx tsc --noEmit

build: ## Produce a static export bundle (android; mobile-only app)
	npx expo export --platform android

# --- Docker tooling (backend is hosted Supabase; Docker runs the tooling) ---
docker-seed: ## Seed the DB from a container
	@docker compose run --rm seed

docker-reset: ## Reset + seed the DB from a container
	@docker compose run --rm reset

docker-typecheck: ## Type-check inside a container
	@docker compose run --rm typecheck

docker-build: ## Build the static export bundle inside a container
	@docker compose run --rm build
