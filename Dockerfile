FROM node:20-slim

WORKDIR /app

# Copy only .output (pre-built by CI)
COPY .output/ .output/

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
