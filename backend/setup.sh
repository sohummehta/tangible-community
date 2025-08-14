#!/bin/bash

echo "Setting up Django + PostgreSQL + Docker backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Build and start containers
echo "Building and starting Docker containers..."
docker compose up --build -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running Django migrations..."
docker compose exec -T web python manage.py makemigrations
docker compose exec -T web python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
docker compose exec -T web python manage.py createsuperuser --noinput --username admin --email admin@example.com || echo "Superuser already exists or creation failed"

echo "Setup complete!"
echo "Access your application at:"
echo "- Django Admin: http://localhost:8000/admin/"
echo "- API: http://localhost:8000/api/"
echo "- Tasks API: http://localhost:8000/api/tasks/"
echo ""
echo "To stop the application: docker compose down"
echo "To view logs: docker compose logs -f" 