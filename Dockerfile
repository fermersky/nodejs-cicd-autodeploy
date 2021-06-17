FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci && npm i -g typescript ts-node

COPY . .

CMD ["npm", "start"]