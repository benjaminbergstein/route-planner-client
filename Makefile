install:
	docker-compose run client install

start:
	docker-compose up -d

stop:
	docker-compose down --remove-orphans

build-js:
	docker-compose run client build
