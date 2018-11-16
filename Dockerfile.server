FROM node:alpine
RUN apk add tzdata  # to be able to run server in different timezones
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "server"]
