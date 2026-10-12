
FROM node:22-alpine AS base

ENV CI=true
RUN npm install -g pnpm@11.20.0
WORKDIR /repo

# 1) Download every package in the lockfile into the cached store
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm fetch --store-dir /pnpm/store

# 2) Install Stats and its workspace dependencies, then compile
FROM deps AS build
COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --offline --frozen-lockfile --ignore-scripts --store-dir /pnpm/store --filter 'stats...'

RUN pnpm --filter shared build
RUN pnpm --filter stats build

# 3) Install production dependencies for Stats and its workspace dependencies
FROM deps AS prod-deps
COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --offline --frozen-lockfile --ignore-scripts --prod --store-dir /pnpm/store --filter 'stats...'

# If "shared" has no runtime dependencies, pnpm creates no node_modules folder
# for it, and the COPY below would fail. Make sure the folder always exists.
RUN mkdir -p packages/shared/node_modules

# 4) Runtime image
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/services/stats/node_modules ./services/stats/node_modules
COPY --from=prod-deps /repo/services/stats/package.json ./services/stats/package.json
COPY --from=build /repo/services/stats/dist ./services/stats/dist

# Include the shared workspace package at runtime
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=prod-deps /repo/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /repo/services/stats
USER node
EXPOSE 3002
CMD ["node", "dist/index.js"]