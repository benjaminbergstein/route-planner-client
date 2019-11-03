export IMAGE_NAME = benbergstein/route-web:latest

build-image:
	docker build . -t ${IMAGE_NAME}

push-image:
	docker push ${IMAGE_NAME}

install:
	docker-compose run client install

start:
	docker-compose up -d

stop:
	docker-compose down --remove-orphans

build-js:
	docker-compose run client build
