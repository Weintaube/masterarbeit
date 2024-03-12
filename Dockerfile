# Use an official Node runtime as a parent image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
