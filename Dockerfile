FROM paperplanecc/paperplane-api-base:latest

EXPOSE 6100

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/
RUN yarn

COPY . /app/
RUN yarn build

CMD [ "yarn", "start:prod" ]