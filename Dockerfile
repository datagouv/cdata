FROM node:20

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest-10 --activate

WORKDIR /app

COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_OPTIONS=--max_old_space_size=4096

ARG NUXT_PUBLIC_COMMIT_ID
ENV NUXT_PUBLIC_COMMIT_ID=$NUXT_PUBLIC_COMMIT_ID

RUN cd datagouv-components && pnpm install && pnpm run css && cd - && pnpm install

RUN echo "$(date)" && \
    export $(cat /app/*.env | xargs) && \
    pnpm run build

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
