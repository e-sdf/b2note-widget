FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "scripts/mkConfig.sh", "scripts/start.sh", "./"]
COPY dist dist 
RUN npm install --production --silent
EXPOSE 3061
RUN ls -l
CMD ./mkConfig.sh; ./start.sh