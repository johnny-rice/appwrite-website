FROM node:20-bullseye AS base

ARG PUBLIC_APPWRITE_ENDPOINT
ENV PUBLIC_APPWRITE_ENDPOINT ${PUBLIC_APPWRITE_ENDPOINT}

ARG PUBLIC_APPWRITE_DASHBOARD
ENV PUBLIC_APPWRITE_DASHBOARD ${PUBLIC_APPWRITE_DASHBOARD}

ARG PUBLIC_APPWRITE_COL_MESSAGES_ID
ENV PUBLIC_APPWRITE_COL_MESSAGES_ID ${PUBLIC_APPWRITE_COL_MESSAGES_ID}

ARG PUBLIC_APPWRITE_COL_THREADS_ID
ENV PUBLIC_APPWRITE_COL_THREADS_ID ${PUBLIC_APPWRITE_COL_THREADS_ID}

ARG PUBLIC_APPWRITE_DB_MAIN_ID
ENV PUBLIC_APPWRITE_DB_MAIN_ID ${PUBLIC_APPWRITE_DB_MAIN_ID}

ARG PUBLIC_APPWRITE_FN_TLDR_ID
ENV PUBLIC_APPWRITE_FN_TLDR_ID ${PUBLIC_APPWRITE_FN_TLDR_ID}

ARG PUBLIC_APPWRITE_PROJECT_ID
ENV PUBLIC_APPWRITE_PROJECT_ID ${PUBLIC_APPWRITE_PROJECT_ID}

ARG PUBLIC_APPWRITE_PROJECT_INIT_ID
ENV PUBLIC_APPWRITE_PROJECT_INIT_ID ${PUBLIC_APPWRITE_PROJECT_INIT_ID}

ARG PUBLIC_GROWTH_ENDPOINT
ENV PUBLIC_GROWTH_ENDPOINT ${PUBLIC_GROWTH_ENDPOINT}

ARG PUBLIC_POSTHOG_API_KEY
ENV PUBLIC_POSTHOG_API_KEY ${PUBLIC_POSTHOG_API_KEY}

ARG APPWRITE_DB_INIT_ID
ENV APPWRITE_DB_INIT_ID ${APPWRITE_DB_INIT_ID}

ARG APPWRITE_COL_INIT_ID
ENV APPWRITE_COL_INIT_ID ${APPWRITE_COL_INIT_ID}

ARG APPWRITE_API_KEY_INIT
ENV APPWRITE_API_KEY_INIT ${APPWRITE_API_KEY_INIT}

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN ${GITHUB_TOKEN}

ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE ${SENTRY_RELEASE}

ARG PUBLIC_POSTHOG_API_KEY
ENV PUBLIC_POSTHOG_API_KEY ${PUBLIC_POSTHOG_API_KEY}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN npm i -g corepack@latest
RUN corepack enable

FROM base AS build

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN NODE_OPTIONS=--max_old_space_size=16384 pnpm run build

FROM base AS final

# Install fontconfig
COPY ./local-fonts /usr/share/fonts
RUN apt-get update && \
    apt-get install -y fontconfig && \
    apt-get autoremove --purge && \
    rm -rf /var/lib/apt/lists/*
RUN fc-cache -f -v
COPY --from=build /app/build/ build
COPY --from=build /app/server/ server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

CMD [ "node", "server/main.js"]
