FROM node:19-alpine

COPY . /workspace
WORKDIR /workspace
RUN npm install

EXPOSE 8081

CMD npm run