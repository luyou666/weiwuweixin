# ---- Build Stage ----
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest && corepack enable
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY package.json .
COPY packages/shared/package.json packages/shared/
COPY packages/scoring/package.json packages/scoring/
COPY apps/api/package.json apps/api/

FROM base AS builder
WORKDIR /app
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json .
COPY packages/shared/ packages/shared/
COPY packages/scoring/ packages/scoring/
COPY apps/api/ apps/api/
WORKDIR /app/apps/api
RUN npx prisma generate

# ---- Runner Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache bash openssl
RUN npm install -g corepack@latest && corepack enable
COPY --from=builder /app/ /app/
COPY scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh
RUN chmod +x /app/scripts/docker-entrypoint.sh
EXPOSE 3001
CMD ["sh", "/app/scripts/docker-entrypoint.sh"]
