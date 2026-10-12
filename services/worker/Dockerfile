
FROM node:22-alpine AS base
RUN npm install -g pnpm@11.20.0
ENV CI=true
WORKDIR /repo

# 1) Download every package in the lockfile into the cached store
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm fetch --store-dir /pnpm/store

# 2) Install all deps (incl. TypeScript) for worker + shared, then compile
FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --offline --frozen-lockfile --ignore-scripts --store-dir /pnpm/store --filter 'worker...'

RUN pnpm --filter shared build
RUN pnpm --filter worker build

# 3) Install production deps only (no TypeScript, ESLint, types...)
FROM deps AS prod-deps
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm,sharing=locked \
    pnpm install --offline --frozen-lockfile --ignore-scripts --prod --store-dir /pnpm/store --filter 'worker...'
# If "shared" has no runtime dependencies, pnpm creates no node_modules folder
# for it, and the COPY below would fail. Make sure the folder always exists.
RUN mkdir -p packages/shared/node_modules

# 4) Small runtime image: node + prod deps + compiled JS
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/services/worker/node_modules ./services/worker/node_modules
COPY --from=prod-deps /repo/services/worker/package.json ./services/worker/package.json
COPY --from=build /repo/services/worker/dist ./services/worker/dist

# The shared workspace package, needed at runtime
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=prod-deps /repo/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /repo/services/worker
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
