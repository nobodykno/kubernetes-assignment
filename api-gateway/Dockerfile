
FROM node:22-alpine AS base
ENV CI=true
RUN npm install -g pnpm@11.20.0
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

FROM deps AS build
COPY . .

# CHANGE 1: Include API Gateway and its workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --filter 'api-gateway...'

RUN pnpm --filter shared build
RUN pnpm --filter api-gateway build

FROM deps AS prod-deps
COPY . .

# CHANGE 2: Include API Gateway and its production workspace dependencies
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter 'api-gateway...'

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/api-gateway/node_modules ./api-gateway/node_modules
COPY --from=prod-deps /repo/api-gateway/package.json ./api-gateway/package.json
COPY --from=build /repo/api-gateway/dist ./api-gateway/dist

# Include the shared workspace package required at runtime
COPY --from=build /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /repo/packages/shared/dist ./packages/shared/dist
COPY --from=prod-deps /repo/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /repo/api-gateway
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
