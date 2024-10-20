# Step 1: Build the NestJS app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Step 2: Set up NGINX and Supervisor in the final image
FROM nginx:alpine

# Install Supervisor to manage multiple processes
RUN apk add --no-cache supervisor

# Install Node.js and Supervisor inside the NGINX container
RUN apk add --no-cache nodejs npm supervisor

# Copy NGINX config
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# Copy Supervisor configuration file
COPY deploy/supervisord.conf /etc/supervisord.conf

# Copy built NestJS app from the builder step
COPY --from=builder /app /app

EXPOSE 8080

# Command to run both NGINX and NestJS via Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]