FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Restrict Node memory to prevent OOM / SIGKILL on limited RAM EC2 instances
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
