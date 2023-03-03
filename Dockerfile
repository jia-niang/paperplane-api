FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn
RUN yarn build

USER node

CMD [ "yarn", "start:prod" ]