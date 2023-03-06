FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn && yarn build

CMD [ "yarn", "start:prod" ]