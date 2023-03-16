FROM paperplanecc/paperplane-api-base:latest
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn && yarn build

CMD [ "yarn", "start:prod" ]