
FROM node:22-alpine AS base
RUN npm install -g pnpm@11.20.0

ENV CI=true
WORKDIR /repo

# 1. Download packages using the lockfile
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

# 2. Install dependencies and build the shared package and Worker
FROM deps AS build
COPY . .

# CHANGE 1: Include Worker and its workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --filter 'worker...'  

RUN pnpm --filter shared build
RUN pnpm --filter worker build

# 3. Install production dependencies only
FROM deps AS prod-deps
COPY . .

# CHANGE 2: Include Worker and its production workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter 'worker...'

# 4. Runtime image
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/services/worker/node_modules ./services/worker/node_modules
COPY --from=prod-deps /repo/services/worker/package.json ./services/worker/package.json
COPY --from=build /repo/services/worker/dist ./services/worker/dist

# Include the shared workspace package at runtime
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=prod-deps /repo/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /repo/services/worker
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
