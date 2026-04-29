FROM node:20-alpine

WORKDIR /app/config-service

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 6000

CMD ["pnpm", "start"]

