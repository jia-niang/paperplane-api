FROM node:19-slim
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn
RUN yarn build

CMD [ "yarn", "start:prod" ]