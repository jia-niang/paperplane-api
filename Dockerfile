FROM paperplanecc/paperplane-api-base:latest

EXPOSE 6100

WORKDIR /paperplane-api

COPY package.json /paperplane-api/
COPY yarn.lock /paperplane-api/
RUN yarn

COPY ./prisma /paperplane-api/prisma
RUN yarn dbgen

COPY . /paperplane-api/
RUN yarn build

CMD [ "yarn", "start:prod" ]