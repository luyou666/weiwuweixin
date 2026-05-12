# ---- Build Stage ----
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g corepack@latest && corepack enable
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY package.json .
COPY packages/shared/package.json packages/shared/
COPY packages/scoring/package.json packages/scoring/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/

FROM base AS builder
WORKDIR /app
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json .
COPY packages/shared/ packages/shared/
COPY packages/scoring/ packages/scoring/
COPY packages/ui/ packages/ui/
COPY apps/web/ apps/web/
WORKDIR /app/apps/web
ENV NEXT_PUBLIC_API_URL=/api
RUN pnpm build

# ---- Runner Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=builder /app/apps/web/public /app/apps/web/public
RUN chown -R app:app /app
USER app
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
