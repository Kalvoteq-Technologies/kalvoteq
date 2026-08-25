FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "node_modules/srvx/bin/srvx.mjs", "serve", "--prod", "--entry", "./dist/server/server.js", "--static", "../client", "--port", "3000", "--host", "0.0.0.0"]