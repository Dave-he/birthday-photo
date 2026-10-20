# This Dockerfile uses `serve` npm package to serve the static files with node process.
# You can find the Dockerfile for nginx in the following link:
# https://github.com/refinedev/dockerfiles/blob/main/vite/Dockerfile.nginx
FROM refinedev/node:18 AS base

FROM base as deps

# The build context is the repository root (see docker-compose.yml), so the
# admin's own manifest and lockfile live under `apps/admin`. The base
# image's working directory is already `/app/refine`.
COPY apps/admin/package.json apps/admin/yarn.lock* apps/admin/package-lock.json* apps/admin/pnpm-lock.yaml* apps/admin/.npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm@10 && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base as builder

ENV NODE_ENV production

# `VITE_*` values are inlined into the bundle at build time, so they have to
# be passed in as build arguments - setting them on the running container
# would have no effect on the browser.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WEB_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_WEB_URL=$VITE_WEB_URL

COPY --from=deps /app/refine/node_modules ./node_modules

# Build the admin app itself - copying the whole repository root here would
# put the root manifest in place of the admin's and build the wrong thing.
COPY apps/admin/ ./

RUN npm run build

FROM base as runner

ENV NODE_ENV production

RUN npm install -g serve

COPY --from=builder /app/refine/dist ./

USER refine

CMD ["serve"]
