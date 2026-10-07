

FROM node:24-alpine AS base
RUN npm install -g pnpm@11.20.0

ENV CI=true
WORKDIR /repo

# 1) Download packages using only the lockfile (cached until the lockfile changes)
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

# 2) Install all deps for this service and compile TypeScript -> dist/
FROM deps AS build
COPY . .
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --filter worker
RUN pnpm --filter worker build

# 3) Install production deps only (no TypeScript, no types)
FROM deps AS prod-deps
COPY . .
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter worker

# 4) Small runtime image: node + prod deps + compiled JS
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/services/worker/node_modules ./services/worker/node_modules
COPY --from=build /repo/services/worker/dist ./services/worker/dist
COPY services/worker/package.json ./services/worker/package.json

WORKDIR /repo/services/worker
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
