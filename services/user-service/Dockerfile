FROM node:20-alpine

WORKDIR /app/user-service

COPY package.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 1000

CMD [ "node", "dist/server.js" ]