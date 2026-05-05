FROM node:24-alpine

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
