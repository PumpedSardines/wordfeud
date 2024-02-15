FROM node:20
WORKDIR /app
# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --also=dev --ignore-scripts
COPY . .
RUN npm run build
CMD ["npm", "start"]
