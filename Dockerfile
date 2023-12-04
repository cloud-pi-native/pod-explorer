FROM node:20-alpine
RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.js ./
USER 1001
CMD [ "node", "index.js" ]
