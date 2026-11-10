# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 STAGELUMEN_STANDALONE=1
# The env file is a BuildKit secret, outside the source tree and image layers.
# Public variables are baked into the browser bundle; server secrets are runtime env.
RUN --mount=type=secret,id=app_env,required=true \
    DOTENV_CONFIG_PATH=/run/secrets/app_env \
    node --require dotenv/config node_modules/next/dist/bin/next build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
