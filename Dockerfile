# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

FROM deps AS build
COPY tsconfig.json jest.config.ts ./
COPY src ./src
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY .env.example ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
