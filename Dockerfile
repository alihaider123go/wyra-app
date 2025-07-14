# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install OS-level dependencies
RUN apk update && apk upgrade
RUN apk add git

# Copy package.json and package-lock.json first to install dependencies separately
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Nuxt.js app for production
RUN npm run build

# Expose the port Nuxt.js will run on
EXPOSE 7070

# Set the environment port
ENV PORT 7070

# Command to run Nuxt.js in production mode
CMD [ "npm", "start" ]
