#
# Hardhat
#

project:
	docker-compose run --rm hardhat npm init
	docker-compose run --rm hardhat npm install --save-dev "hardhat@^2.6.8"
	docker-compose run --rm hardhat npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai
	docker-compose run --rm hardhat npx hardhat

compile:
	docker compose run --rm hardhat npx hardhat compile

unit-test:
	docker compose run --rm hardhat npx hardhat test

deploy-check:
	docker compose run --rm hardhat npx hardhat run scripts/deploy.js

node:
	docker compose up hardhat

deploy:
	docker compose run --rm hardhat npx hardhat run scripts/deploy.js --network hardhat

destroy:
	docker compose down --rmi all --volumes --remove-orphans

#
# Ganache
#

ganache:
	docker compose up ganache

deploy-ganache:
	docker compose run --rm hardhat npx hardhat run scripts/deploy.js --network ganache
