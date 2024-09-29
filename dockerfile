FROM node:18-alpine3.20

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./.prettierrc.json ./
COPY ./.eslintrc.json ./
COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./nodemon.json ./
COPY ./public ./public
COPY ./public_offline ./public_offline
COPY ./src ./src
EXPOSE 4000
ENV PORT=4000

RUN yarn install
# If you are building your code for production
# RUN npm --omit=dev

# Bundle app source
# CMD ["ls", "-la"]
CMD [ "yarn", "start" ] 