FROM node:18.14.1-slim

WORKDIR /app

COPY BankAPICollect/package*.json ./
COPY BankAPICollect/src .

RUN npm install

COPY . .

CMD ["node", "update.js"]
