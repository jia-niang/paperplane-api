FROM node:19-slim
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn --registry=https://registry.yarnpkg.com
RUN yarn build

CMD [ "yarn", "start:prod" ]