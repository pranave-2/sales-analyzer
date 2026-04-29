FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all remaining frontend files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start React app (mapped to Vite via npm start)
CMD ["npm", "start"]
