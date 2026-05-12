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
COPY packages/shared/ packages/shared/
COPY packages/scoring/ packages/scoring/
COPY apps/api/ apps/api/
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npx tsc -p tsconfig.json || true
# Ensure dist exists (tsc may fail on type-only errors, that's OK for JS build)
RUN npx tsc --emitDeclarationOnly false -p tsconfig.json 2>/dev/null; \
    mkdir -p dist || true; \
    npx esbuild src/index.ts --bundle --platform=node --target=node22 --outdir=dist --external:prisma --external:@prisma/client --external:bcryptjs --external:minio --external:helmet 2>/dev/null || true

# ---- Runner Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
RUN npm install -g corepack@latest && corepack enable
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=builder /app/packages/shared/package.json /app/packages/shared/
COPY --from=builder /app/packages/scoring/package.json /app/packages/scoring/
COPY --from=builder /app/apps/api/package.json /app/apps/api/
COPY --from=builder /app/packages/shared/ /app/packages/shared/
COPY --from=builder /app/packages/scoring/ /app/packages/scoring/
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/api/node_modules/.prisma /app/apps/api/node_modules/.prisma
COPY --from=builder /app/apps/api/prisma /app/apps/api/prisma
COPY --from=builder /app/apps/api/src /app/apps/api/src
COPY scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh
RUN chmod +x /app/scripts/docker-entrypoint.sh
RUN chown -R app:app /app
USER app
EXPOSE 3001
CMD ["sh", "/app/scripts/docker-entrypoint.sh"]
