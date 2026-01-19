FROM node:20-slim

WORKDIR /app

# Copier uniquement .output (pré-buildé par la CI)
COPY .output/ .output/

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
