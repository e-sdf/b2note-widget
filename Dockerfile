FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "start.sh", "./"]
COPY server server
RUN npm install --production --silent
EXPOSE 3061
RUN ls -l
CMD ./start.sh