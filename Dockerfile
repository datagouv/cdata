FROM node:24-slim

WORKDIR /app

# Copy only .output (pre-built by CI)
COPY .output/ .output/

ENV NODE_ENV=production

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
