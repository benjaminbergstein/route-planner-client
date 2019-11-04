export IMAGE_NAME = benbergstein/route-web:latest

all: build
build:
	docker build .. -t ${IMAGE_NAME}

push-image:
	docker push ${IMAGE_NAME}
