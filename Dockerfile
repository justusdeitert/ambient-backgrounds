# Build stage
FROM node:10.13-alpine AS build

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy sources and build
COPY . .
RUN npm run build

# Serve stage
FROM nginx:1.15-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
