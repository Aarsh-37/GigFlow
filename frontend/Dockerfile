FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to handle potential conflicts as suggested by previous errors
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build the React app for production
RUN npm run build

# Serve static files with Nginx for production-like serving
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
