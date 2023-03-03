FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

WORKDIR /app
ADD . /app/
RUN yarn
RUN yarn build

CMD [ "yarn", "start:prod" ]