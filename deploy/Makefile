define COMPOSE_CMD
docker-compose --project-directory ..
endef

all: deploy
deploy:
	${COMPOSE_CMD} up -d
	${COMPOSE_CMD} exec app rm -rf build
	${COMPOSE_CMD} exec app yarn build

undeploy:
	${COMPOSE_CMD} down --remove-orphans
