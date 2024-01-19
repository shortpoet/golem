# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=18.15.0
ARG PNPM_VERSION=8.13.1
ARG NUXT_VERSION=3.3.1
ARG PORT 3000
ARG DOMAIN localhost

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-slim as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
  npm install -g pnpm@${PNPM_VERSION} nuxt@${NUXT_VERSION}

################################################################################
# Create a stage for installing production dependecies.
# FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# Leverage bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them
# into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#   --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
#   --mount=type=cache,target=/root/.local/share/pnpm/store \
#   --mount=type=bind,source=scripts/prepare.ts,target=scripts/prepare.ts \
#   pnpm install --frozen-lockfile --prod

# COPY --link package.json .
# COPY --link pnpm-lock.yaml .
# COPY --link scripts/prepare.ts .
# RUN pnpm install --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM base as build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
# RUN --mount=type=bind,source=package.json,target=package.json \
#   --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
#   --mount=type=cache,target=/root/.local/share/pnpm/store \
#   --mount=type=bind,source=scripts/prepare.ts,target=scripts/prepare.ts \
#   pnpm install --frozen-lockfile

COPY --link package.json .
COPY --link pnpm-lock.yaml .
COPY --link scripts/prepare.ts scripts/prepare.ts
RUN pwd & \
  ls -laR
RUN pnpm install --shamefully-hoist --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .
RUN pwd & \
  ls -la & \
  ls -laR -I node_modules -I public
# Run the build script.
RUN pnpm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production
ENV PORT=${PORT}
ENV DOMAIN=${DOMAIN}

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.output ./.output


# Expose the port that the application listens on.
EXPOSE ${PORT}
ENV PORT=${PORT}
ENV DOMAIN=${DOMAIN}

# Run the application.
CMD ["node", "./.output/server/index.mjs"]
