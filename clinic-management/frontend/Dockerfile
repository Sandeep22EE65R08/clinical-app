# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# ---- Serve ----
FROM nginx:1.27-alpine AS runtime
# The official nginx image renders /etc/nginx/templates/*.template with the
# environment at start-up. Defaults suit Docker Compose; Railway overrides them.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
ENV API_URL=http://api:8080
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
