FROM node:22-slim AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/client/.next ./src/client/.next
COPY --from=builder /usr/src/app/src/client/public ./src/client/public

EXPOSE 8080
CMD ["node", "dist/src/server/index.js"]
