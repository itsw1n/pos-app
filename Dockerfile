# Dockerfile — dev / build tooling for IPSS
# Usage: docker compose run --rm <service>
# The backend is a hosted Supabase project; these containers run only the
# Node tooling (seed, typecheck, build) so the project is runnable with just
# docker + docker compose installed locally.

FROM node:20-alpine AS base
WORKDIR /app
ENV CI=1
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS dev
COPY . .
# Default: drop into a shell / let compose override the command.

FROM dev AS web
RUN npx expo export --platform android

# Compose service overrides CMD to run: seed | reset | typecheck | build | start
FROM dev AS runner
CMD ["npm", "run"]
