# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/order/package.json ./apps/order/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/lintconfig/package.json ./packages/lintconfig/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/db/package.json ./packages/db/package.json

# Install dependencies with pnpm (store cached & shared across app builds)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm i --frozen-lockfile

# Copy prisma schema and .env, then generate client
COPY packages/db/prisma ./packages/db/prisma
COPY .env ./.env
RUN pnpm --filter=@ssurak/db exec prisma generate

# Development stage
FROM deps AS development
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["sh", "-c", "corepack enable pnpm && pnpm dev --filter=@ssurak/order"]

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code for monorepo
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# 이미지 CDN 호스트명은 next.config.mts 의 remotePatterns 에 빌드 타임으로 박히므로
# 런타임 주입이 불가능하다. 컨텍스트의 .env(dev 값)를 덮어쓰려면 build arg 로 넘길 것.
ARG NEXT_PUBLIC_IMAGE_HOSTNAME
ENV NEXT_PUBLIC_IMAGE_HOSTNAME=$NEXT_PUBLIC_IMAGE_HOSTNAME

# Build using turbo
RUN corepack enable pnpm && pnpm build --filter=order

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/order/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/order/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/order/.next/static ./apps/order/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/order/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/order/public ./apps/order/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/order/server.js"]
