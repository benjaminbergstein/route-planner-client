FROM node:latest

EXPOSE 3000

WORKDIR /app
ADD package.json /app/package.json
RUN yarn

ADD . /app
RUN yarn build

ENTRYPOINT ["yarn"]
CMD ["serve"]
