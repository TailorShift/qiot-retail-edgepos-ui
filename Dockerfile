# Install the application dependencies in a full UBI Node docker image
FROM registry.access.redhat.com/ubi8/nodejs-16:latest

# Copy package.json and package-lock.json
COPY ./package*.json ./

# Add app
COPY . ./
USER root
RUN npm install && npm run build


#######################


# Copy the dependencies into a minimal Node.js image
FROM registry.access.redhat.com/ubi8/nodejs-16-minimal:latest

COPY --from=0 /opt/app-root/src/build  /opt/app-root/src
RUN npm install serve

ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

CMD ["./node_modules/.bin/serve"]

