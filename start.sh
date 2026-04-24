#!/bin/bash

# ═══════════════════════════════════════════════════
# AI Quantum Computing Assistant - Startup Script
# ═══════════════════════════════════════════════════

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║   AI Quantum Computing Assistant                  ║"
echo "║   Starting Application...                         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Load .env ──
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

SERVER_PORT=${SERVER_PORT:-3001}
CLIENT_PORT=${CLIENT_PORT:-3000}

# ── Kill processes on used ports ──
echo -e "${YELLOW}Cleaning up ports ${SERVER_PORT} and ${CLIENT_PORT}...${NC}"

kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

kill_port $SERVER_PORT
kill_port $CLIENT_PORT
echo -e "${GREEN}✓ Ports cleaned${NC}"

# ── Check PostgreSQL ──
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL not found. Please install it.${NC}"
  exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 3
fi

# Create database if it doesn't exist
DB_NAME=${DB_NAME:-quantum_computing_assistant}
DB_USER=${DB_USER:-postgres}

echo -e "${BLUE}Checking database '${DB_NAME}'...${NC}"
if ! psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "${YELLOW}Creating database '${DB_NAME}'...${NC}"
  createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
fi
echo -e "${GREEN}✓ Database ready${NC}"

# ── Install server dependencies ──
echo -e "${BLUE}Installing server dependencies...${NC}"
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  npm install --silent 2>&1 | tail -1
fi
echo -e "${GREEN}✓ Server dependencies installed${NC}"

# ── Seed database ──
echo -e "${BLUE}Seeding database...${NC}"
cd "$PROJECT_DIR/server"
node seeds/seed.js
echo -e "${GREEN}✓ Database seeded${NC}"

# ── Install client dependencies ──
echo -e "${BLUE}Installing client dependencies...${NC}"
cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  npm install --silent 2>&1 | tail -1
fi
echo -e "${GREEN}✓ Client dependencies installed${NC}"

# ── Start server with hot reload (nodemon) ──
echo -e "${CYAN}Starting backend server on port ${SERVER_PORT}...${NC}"
cd "$PROJECT_DIR/server"
npx nodemon --watch . --ext js,json index.js &
SERVER_PID=$!
sleep 2

# ── Start client with hot reload (react-scripts) ──
echo -e "${CYAN}Starting frontend client on port ${CLIENT_PORT}...${NC}"
cd "$PROJECT_DIR/client"
PORT=$CLIENT_PORT BROWSER=none npx react-scripts start &
CLIENT_PID=$!

# ── Cleanup on exit ──
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  kill_port $SERVER_PORT
  kill_port $CLIENT_PORT
  echo -e "${GREEN}✓ Application stopped${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "\n${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ AI Quantum Computing Assistant is running!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:${CLIENT_PORT}"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:${SERVER_PORT}"
echo -e "  ${CYAN}Login:${NC}     admin@quantum.ai / quantum123"
echo -e ""
echo -e "  ${YELLOW}Both servers auto-reload on code changes.${NC}"
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo -e ""

# Wait for background processes
wait
