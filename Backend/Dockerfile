FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
# Use npm install instead of ci for better compatibility with different build contexts
RUN npm install --omit=dev

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure the port is handled by Render's environment
ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
