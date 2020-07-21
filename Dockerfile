FROM node:12-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Now we copy the compiled javascript folder only (no typescript).

COPY dist ./dist
COPY .env .env
COPY src/client/.next /src/client/.next
COPY src/client/public ./src/client/public

EXPOSE 3000
CMD ["node", "dist/src/server/index.js"]
