# Build stage
FROM m.daocloud.io/docker.io/library/node:20-alpine AS build-stage
WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./

# Copy app package.json
COPY apps/admin/package.json ./apps/admin/package.json

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter admin...

# Copy source
COPY . .

# Build admin app
WORKDIR /app/apps/admin
RUN pnpm run build

# Production stage
FROM m.daocloud.io/docker.io/library/nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
