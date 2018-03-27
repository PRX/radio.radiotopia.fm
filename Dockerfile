FROM mhart/alpine-node

MAINTAINER PRX <sysadmin@prx.org>
LABEL org.prx.s3static="true"

WORKDIR /app

RUN apk --no-cache add rsync
RUN apk --no-cache add zip

ENTRYPOINT [ "npm", "run" ]
CMD [ "test" ]

ADD package.json .
RUN npm install
ADD . .
RUN npm run build
