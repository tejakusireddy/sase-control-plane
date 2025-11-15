FROM node:20-alpine

WORKDIR /app

# Copy shared package first
COPY shared/package*.json ./shared/
COPY shared/tsconfig.json ./shared/
COPY shared/src ./shared/src

# Copy service package
COPY session-service/package*.json ./session-service/
COPY session-service/tsconfig.json ./session-service/
COPY session-service/src ./session-service/src

# Build shared package first
WORKDIR /app/shared
RUN npm install && npm run build

# Install service dependencies and link shared package
WORKDIR /app/session-service
# Update package.json to use file: protocol for local dependency
RUN node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json')); pkg.dependencies['@sase/shared']='file:../shared'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" && \
    npm install

# Build service
RUN npm run build

# Expose port
EXPOSE 4003

# Start service
CMD ["npm", "start"]

