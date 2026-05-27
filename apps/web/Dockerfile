# Multi-stage Dockerfile for Next.js Web App in Monorepo
FROM node:20-alpine AS base

# Install pnpm
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root and package locks
COPY package.json pnpm-lock.yaml* .npmrc* ./
# Copy web package
COPY apps/web/package.json ./apps/web/

# Install dependencies for apps/web
WORKDIR /app/apps/web
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .

# Copy installed node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

WORKDIR /app/apps/web

# Set environment variables for build time (using placeholders so next build compiles statically)
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
ENV NODE_ENV=production

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app/apps/web

ENV NODE_ENV production

# Don't run production as root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["pnpm", "start"]
