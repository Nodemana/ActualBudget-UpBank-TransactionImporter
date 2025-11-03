FROM --platform=${BUILDPLATFORM} node:20.19.2

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY BankAPICollect/package*.json ./

RUN npm install --build-from-source

COPY BankAPICollect/ ./

CMD ["node", "update.js"]
