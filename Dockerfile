# ------------------------------------------------------------------------------
# First image (just to build typescript, will be discarded)
# ------------------------------------------------------------------------------
FROM node:12-alpine as builder

LABEL stage=builder
RUN apk add git openssh-client

WORKDIR /app

ARG GRAPHQL_SERVER
ARG GRAPHQL_WEBSOCKET_SERVER

# Bundle app source
COPY . .

# Authorize SSH Host
RUN mkdir -p ~/.ssh && chmod 0700 ~/.ssh && \
    ssh-keyscan bitbucket.org > ~/.ssh/known_hosts && \
    # Add the keys and set permissions
    cp id_rsa ~/.ssh/id_rsa && \
    chmod -R 0600 ~/.ssh/

# Install production dependencies
RUN ssh-agent sh -c 'npm install --only=prod' && \
    cp -R node_modules prod_node_modules && \
    ssh-agent sh -c 'npm i' && \
    npm run build

# ------------------------------------------------------------------------------
# Second image (production image)
# ------------------------------------------------------------------------------
FROM node:12-alpine

WORKDIR /usr/src/app

# Now we copy the compiled javascript folder only (no typescript).
COPY --from=builder /app/dist dist
COPY --from=builder /app/prod_node_modules ./node_modules
COPY --from=builder /app/src/client/.next ./src/client/.next
# Copy public files
COPY --from=builder /app/src/client/public ./src/client/public

EXPOSE 3000
CMD ["node", "dist/src/server/index.js"]
