# Use the official Node.js 22 Alpine image
FROM node:22-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Now create the final image
FROM node:22-alpine

# Install NGINX and Supervisor
RUN apk add --no-cache nginx supervisor

# Copy NGINX config
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# Copy Supervisor configuration file
COPY deploy/supervisord.conf /etc/supervisord.conf

# Copy the built NestJS app
COPY --from=builder /app /app

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
