FROM node:alpine

ENV HOME=/home/nupp

COPY package.json npm-shrinkwrap.json $HOME/app/

COPY src/ $HOME/app/src

WORKDIR $HOME/app

RUN npm install

EXPOSE 3000

CMD ["npm", "start", "src/index.js"]
