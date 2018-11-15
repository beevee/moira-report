FROM node:alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run-script build

FROM nginx:alpine
COPY --from=build /app/build /var/www/build
COPY --from=build /app/index.html /var/www
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
