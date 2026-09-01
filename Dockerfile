# Dockerfile — dev / build tooling for IPSS
# Usage: docker compose run --rm <service>
# Supabase CLI owns the local backend stack; these containers run only the
# Node tooling for quality gates.

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

# Compose services override CMD to run quality commands.
FROM dev AS runner
CMD ["npm", "run"]
