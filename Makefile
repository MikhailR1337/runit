setup: install db-migrate

install:
	make -C backend install
	make -C frontend install

db-migrate:
	make -C backend migrate

db-generate:
	make -C backend generate

start:
	make start-backend
	make start-frontend

build:
	make -C frontend buld
	make -C backend buld

lint:
	make lint-frontend
	make lint-backend

lint-frontend:
	make -C frontend lint

lint-backend:
	make -C backend lint

test:
	make -C backend test

test-e2e:
	make -C backend test-e2e

heroku-deploy:
	git push heroku

heroku-logs:
	heroku logs

start-frontend:
	make -C frontend start

start-backend:
	make -C backend start

data-drop:
	make -C backend data-drop
