FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --prod

# on utilise nginx pour servir l'appli
FROM nginx:alpine
COPY --from=build /app/dist/[NOM_DE_TON_APP]/browser /usr/share/nginx/html

# conf nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
