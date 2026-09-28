
FROM node:24-alpine AS base
RUN npm install -g pnpm@11.20.0
WORKDIR /repo

# 1) Download packages using only the lockfile (cached until the lockfile changes)
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch


FROM deps AS build
COPY . .
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --filter submitter
RUN pnpm --filter submitter build


FROM deps AS prod-deps
COPY . .
RUN pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter submitter

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/services/submitter/node_modules ./services/submitter/node_modules
COPY --from=build /repo/services/submitter/dist ./services/submitter/dist
COPY services/submitter/package.json ./services/submitter/package.json

WORKDIR /repo/services/submitter
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
