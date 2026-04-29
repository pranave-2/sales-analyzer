FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all remaining backend files
COPY . .

# Expose port 5000
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
