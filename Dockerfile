FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

USER root
WORKDIR /app
ADD . /app/
RUN yarn
RUN yarn build

USER pptruser

CMD [ "yarn", "start:prod" ]