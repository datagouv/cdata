FROM node:20

WORKDIR /app

COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_OPTIONS=--max_old_space_size=4096

RUN cd datagouv-components && npm install && npm run css && npm run i18n && cd - && npm install

RUN echo "$(date)" && \
    export $(cat /app/*.env | xargs) && \
    npm run build
    
EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
