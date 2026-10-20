# Multi-stage Dockerfile for Next.js Web App in Monorepo
#
# The Alpine version is pinned: the current `node:20-alpine` is built for
# the x86-64-v3 instruction set, and the kernel refuses such a binary with
# "exec format error" on a CPU without AVX2. `alpine3.20` still targets
# the older baseline and runs everywhere.
FROM node:20-alpine3.20 AS base

# Install pnpm
#
# The version is pinned: the lockfile was written by pnpm 10, and pnpm 11
# and 12 read the `onlyBuiltDependencies` allowlist from a different place -
# an unpinned "latest" would fail the install for a reason that has nothing
# to do with the project.
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root and package locks
COPY package.json pnpm-lock.yaml* .npmrc* ./
# Copy web package
COPY apps/web/package.json ./apps/web/
# The lockfile has to sit next to the manifest it belongs to: pnpm looks for
# it in the current working directory, and `--frozen-lockfile` fails outright
# when it cannot find one.
COPY apps/web/pnpm-lock.yaml ./apps/web/

# Install dependencies for apps/web
WORKDIR /app/apps/web
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .

# Copy the installed dependencies.
# There is no root `node_modules`: pnpm installs into the app directory
# (the working directory of the deps stage), so the virtual store lives in
# `apps/web/node_modules/.pnpm` and is copied along with it.
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

WORKDIR /app/apps/web

# `NEXT_PUBLIC_*` values are inlined into the client bundle at build time, so
# they have to be passed in as build arguments - setting them on the running
# container would have no effect on the browser. The defaults only exist so
# that a build without arguments still succeeds.
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
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
