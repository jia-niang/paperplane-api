FROM paperplanecc/node-19-puppeteer
EXPOSE 6100

WORKDIR /app
RUN sudo chmod 
RUN chown -R node /app/**
USER node

ADD . /app/
RUN yarn
RUN yarn build

CMD [ "yarn", "start:prod" ]