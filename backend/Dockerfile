FROM node:20-alpine

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["yarn", "dev"]
