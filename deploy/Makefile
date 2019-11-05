define COMPOSE_CMD
docker-compose -p route-planner-prod --project-directory ..
endef

all: deploy
deploy:
	${COMPOSE_CMD} up -d
	${COMPOSE_CMD} exec app rm -rf build
	${COMPOSE_CMD} exec app yarn build

restart:
	${COMPOSE_CMD} up -d --no-deps
	${COMPOSE_CMD} exec app rm -rf build
	${COMPOSE_CMD} exec app yarn build

undeploy:
	${COMPOSE_CMD} down --remove-orphans
