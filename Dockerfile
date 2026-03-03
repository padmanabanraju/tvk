# TVK — Production Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install ALL dependencies (need devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies + source after build
RUN npm prune --omit=dev && rm -rf src vite.config.js tailwind.config.js postcss.config.js index.html

EXPOSE 3000

CMD ["node", "server.js"]
