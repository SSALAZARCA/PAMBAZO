FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Root package.json contains all dependencies
RUN npm install --production
COPY backend/ ./backend/
COPY database/ ./database/
EXPOSE 3001
CMD ["node", "backend/server.cjs"]