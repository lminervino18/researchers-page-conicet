#!/bin/bash

# Function to check and free a specific port
check_and_free_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "Port $port is in use. Freeing..."
        sudo kill -9 $(lsof -t -i:$port)
        sleep 2
    fi
}

# Check and free required ports
check_and_free_port 8080  # For Backend
check_and_free_port 5173  # For Frontend
check_and_free_port 5174  # Alternative port used by Vite

# Open terminal for MySQL
# This connects to MySQL with the specified user and password
gnome-terminal --tab --title="MySQL" -- bash -c "mysql -u mi_usuario -pnuevaPassword123; exec bash"

# Open terminal for backend
# Changes to backend directory and starts Spring Boot application
gnome-terminal --tab --title="Backend" -- bash -c "echo 'Checking port 8080...' && cd backend && mvn spring-boot:run; exec bash"

# Open terminal for frontend
# Changes to frontend directory and starts Vite development server
gnome-terminal --tab --title="Frontend" -- bash -c "echo 'Checking ports 5173/5174...' && cd frontend && npm run dev; exec bash"