
FROM node:22-alpine AS base

ENV CI=true
RUN npm install -g pnpm@11.20.0
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

FROM deps AS build
COPY . .

# Install Stats and its workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --filter 'stats...'

RUN pnpm --filter shared build
RUN pnpm --filter stats build

FROM deps AS prod-deps
COPY . .

# Install production dependencies for Stats and its workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter 'stats...'

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
