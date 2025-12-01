FROM node:20-alpine

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files and install dependencies
COPY package.json ./
RUN yarn install

# Copy source code
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

EXPOSE 5173

CMD ["yarn", "dev", "--host"]
