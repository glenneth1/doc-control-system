#!/bin/bash

# Exit on any error
set -e

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        exit 1
    fi
}

# Check if required ports are available
check_port 8080
check_port 8000

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up backend...${NC}"

# Create and activate virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
fi

# Activate virtual environment
source backend/venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Run database migrations
echo "Running database migrations..."
cd backend
python scripts/run_migrations.py
cd ..

echo -e "${BLUE}Setting up frontend...${NC}"

# Install frontend dependencies and build
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Building frontend..."
npm run build

# Start servers
echo -e "${GREEN}Starting servers...${NC}"

# Start backend server in background
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend server in background
cd ../frontend
npm run preview -- --port 8080 &
FRONTEND_PID=$!

echo -e "${GREEN}Servers started successfully!${NC}"
echo -e "Frontend running at: ${BLUE}http://localhost:8080${NC}"
echo -e "Backend running at:  ${BLUE}http://localhost:8000${NC}"
echo "Press Ctrl+C to stop both servers"

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

# Keep script running
wait
