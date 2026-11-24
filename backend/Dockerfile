
FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend application
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
