#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="bplan"
COMPOSE_FILE="docker-compose.yaml"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

log() {
    echo -e "${BLUE}[DEPLOY]${RESET} $1"
}

success() {
    echo -e "${GREEN}[ OK ]${RESET} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${RESET} $1"
}

error() {
    echo -e "${RED}[ERROR]${RESET} $1"
}

cleanup_on_error() {
    error "Deploy failed!"
    echo
    echo "Последние логи контейнера:"
    docker compose -f "$COMPOSE_FILE" logs --tail=100 "$APP_NAME" 2>/dev/null || true
}

trap cleanup_on_error ERR

echo
echo "========================================"
echo "        BPLAN PRODUCTION DEPLOY"
echo "========================================"
echo

# --------------------------------------------------
# 1. Проверка окружения
# --------------------------------------------------

log "Checking environment..."

if ! command -v docker >/dev/null 2>&1; then
    error "Docker is not installed"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    error "Docker Compose is not available"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    error "$COMPOSE_FILE not found"
    exit 1
fi

if [ ! -f ".env" ]; then
    warning ".env not found"
fi

success "Environment OK"

# --------------------------------------------------
# 2. Создание директории БД
# --------------------------------------------------

log "Preparing database directory..."

mkdir -p data

success "Database directory ready"

# --------------------------------------------------
# 3. Сборка Docker image
# --------------------------------------------------

log "Building Docker image..."

docker compose -f "$COMPOSE_FILE" build --pull

success "Docker image built"

log "Building Docker image..."
docker compose -f "$COMPOSE_FILE" build --pull
success "Docker image built"

log "Running database migrations..."
docker compose -f "$COMPOSE_FILE" run --rm app \
    bun run db:migrate
success "Database migrations completed"

log "Running database seed..."
docker compose -f "$COMPOSE_FILE" run --rm app \
    bun run db:seed
success "Database seed completed"

# --------------------------------------------------
# 4. Запуск контейнера
# --------------------------------------------------

log "Starting application..."

docker compose -f "$COMPOSE_FILE" up -d

success "Application container started"

# --------------------------------------------------
# 5. Ожидание запуска
# --------------------------------------------------

log "Waiting for application..."

MAX_ATTEMPTS=30
ATTEMPT=0

while true; do
    ATTEMPT=$((ATTEMPT + 1))

    if docker compose -f "$COMPOSE_FILE" ps --status running \
        | grep -q "$APP_NAME"; then
        success "Container is running"
        break
    fi

    if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
        error "Container did not start"

        docker compose -f "$COMPOSE_FILE" logs --tail=100 "$APP_NAME"

        exit 1
    fi

    sleep 2
done


log "Checking application status..."

if ! docker compose -f "$COMPOSE_FILE" ps --status running \
    | grep -q "$APP_NAME"; then

    error "Application container is not running"

    docker compose -f "$COMPOSE_FILE" logs --tail=100 "$APP_NAME"

    exit 1
fi

success "Application is running"

# --------------------------------------------------
# 9. Показать состояние Docker
# --------------------------------------------------

echo
log "Docker containers:"
docker compose -f "$COMPOSE_FILE" ps

# --------------------------------------------------
# 10. Последние логи
# --------------------------------------------------

echo
log "Application logs:"
echo "----------------------------------------"

docker compose -f "$COMPOSE_FILE" logs \
    --tail=30 \
    "$APP_NAME"

echo "----------------------------------------"

# --------------------------------------------------
# 11. SUCCESS
# --------------------------------------------------

echo
echo -e "${GREEN}========================================${RESET}"
echo -e "${GREEN}          DEPLOY SUCCESS${RESET}"
echo -e "${GREEN}========================================${RESET}"
echo
echo "Application: $APP_NAME"
echo "Status:      RUNNING"
echo "Migrations:  OK"
echo "Seed:        OK"
echo
echo "Logs:"
echo "  docker compose logs -f $APP_NAME"
echo