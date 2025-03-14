FROM node:23.9.0

WORKDIR /usr/src/app/frontend/

COPY ./package*.json .

RUN npm i

COPY . .

EXPOSE 81

CMD ["npm","run","dev"]