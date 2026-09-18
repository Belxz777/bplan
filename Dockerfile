FROM oven/bun:1 AS base

WORKDIR /app

# Сначала зависимости — чтобы Docker кэшировал этот слой
COPY package.json bun.lock ./

RUN bun install --frozen-lockfile 

# Исходники
COPY . .

# SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]