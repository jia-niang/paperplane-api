FROM node:19-slim
EXPOSE 5000

WORKDIR /app
ADD . /app/
RUN yarn --registry=https://registry.npmmirror.com
RUN yarn build

CMD [ "yarn", "start:prod" ]