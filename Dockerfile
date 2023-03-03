FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

WORKDIR /app
ADD . /app/

RUN cd app
RUN sudo chown -R node *

USER node
RUN yarn
RUN yarn build

CMD [ "yarn", "start:prod" ]