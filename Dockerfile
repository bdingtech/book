FROM node:alpine

COPY . /home/app

RUN cd /home/app && npm install --registry=https://registry.npm.taobao.org

RUN npm install cross-env -g --registry=https://registry.npm.taobao.org && npm install pm2 -g --registry=https://registry.npm.taobao.org

WORKDIR /home/app

EXPOSE 3000

CMD [ "npm", "start", "prd" ]