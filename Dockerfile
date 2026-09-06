# syntax=docker/dockerfile:1

# ---------- Etapa 1: construir la aplicación ----------
FROM node:22-alpine AS build

WORKDIR /app

# Solo el manifiesto primero: mientras no cambie, Docker reutiliza la capa de npm ci
# y no vuelve a descargar las dependencias en cada build.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: servir los ficheros ya construidos ----------
# La imagen final no lleva ni node_modules ni el código fuente: solo dist y nginx.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
