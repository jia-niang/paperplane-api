FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

USER node
RUN cd ~
RUN mkdir app

WORKDIR /home/node/app
ADD . /home/node/app/

RUN yarn
RUN yarn build

CMD [ "yarn", "start:prod" ]