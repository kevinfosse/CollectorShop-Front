FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BUILD_CONFIG=production                                                                                                                 
RUN npx ng build --configuration=${BUILD_CONFIG}


FROM nginx:alpine
RUN apk upgrade --no-cache && apk add --upgrade zlib
COPY --from=build /app/dist/CollectorShop/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
