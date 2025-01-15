FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install node-firestore-import-export

COPY . .

EXPOSE 5000

CMD npm run start