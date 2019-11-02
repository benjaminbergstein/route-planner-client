build-image:
	docker build . -t benbergstein/route-web:latest

install:
	docker-compose run client install

start-routeservice:
	docker-compose run -d -p "8080:8080" routeservice

start:
	docker-compose up -d

serve:
	docker-compose run -d -p "80:5000" client serve

stop:
	docker-compose down --remove-orphans

build-js:
	docker-compose run client build
