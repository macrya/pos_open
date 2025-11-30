# POS Microservices - Development Commands

.PHONY: help install build up down logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for all services
	@echo "Installing shared dependencies..."
	cd shared && npm install
	@echo "Installing API Gateway dependencies..."
	cd services/api-gateway && npm install
	@echo "Installing Auth Service dependencies..."
	cd services/auth-service && npm install
	@echo "Installing Inventory Service dependencies..."
	cd services/inventory-service && npm install
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed"

build: ## Build all Docker images
	docker-compose build

up: ## Start all services with Docker Compose
	docker-compose up -d
	@echo "✓ All services started"
	@echo "Frontend: http://localhost:3000"
	@echo "API Gateway: http://localhost:8000"
	@echo "RabbitMQ Management: http://localhost:15672"

dev: ## Start services in development mode
	docker-compose up

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

logs-service: ## Show logs for specific service (usage: make logs-service SERVICE=api-gateway)
	docker-compose logs -f $(SERVICE)

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all
	@echo "✓ Cleaned up all Docker resources"

restart: ## Restart all services
	docker-compose restart

ps: ## Show running services
	docker-compose ps

shell: ## Open shell in specific service (usage: make shell SERVICE=api-gateway)
	docker-compose exec $(SERVICE) /bin/sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres

rabbitmq-shell: ## Open RabbitMQ management
	@echo "Opening RabbitMQ Management UI..."
	@echo "URL: http://localhost:15672"
	@echo "User: pos_user"
	@echo "Password: pos_password"

test: ## Run tests for all services
	@echo "Running tests..."
	cd services/api-gateway && npm test || true
	cd services/auth-service && npm test || true
	cd services/inventory-service && npm test || true

# Kubernetes commands
k8s-apply: ## Apply Kubernetes configurations
	kubectl apply -f infrastructure/kubernetes/

k8s-delete: ## Delete Kubernetes resources
	kubectl delete -f infrastructure/kubernetes/

k8s-status: ## Show Kubernetes pod status
	kubectl get pods

# Database migrations
migrate-auth: ## Run auth service migrations
	docker-compose exec auth-service npm run migrate

migrate-inventory: ## Run inventory service migrations
	docker-compose exec inventory-service npm run migrate

# Development helpers
dev-gateway: ## Run API Gateway in dev mode
	cd services/api-gateway && npm run dev

dev-auth: ## Run Auth Service in dev mode
	cd services/auth-service && npm run dev

dev-inventory: ## Run Inventory Service in dev mode
	cd services/inventory-service && npm run dev

dev-frontend: ## Run Frontend in dev mode
	cd frontend && npm run dev
