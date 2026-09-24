FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 10000
CMD ["npm", "start"]
