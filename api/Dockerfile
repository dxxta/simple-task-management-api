# image
FROM node:alpine
# create and set directory
WORKDIR /app
# Install dependencies for building FFmpeg
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
# Copy the rest of the application files to the container
COPY . .
CMD [ "npm", "run", "migrate", "-y" ]
CMD [ "npm", "run", "generate", ]
CMD [ "npm", "run", "start" ]