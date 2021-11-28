const {
  ethers
} = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const TodoList = await ethers.getContractFactory('TodoList');
  const todoList = await TodoList.deploy();

  console.log("Todo list task data count:", await todoList.dataCount());
  console.log("Todo list active task count:", await todoList.taskCount());

  saveFrontendFiles(todoList);
}

function saveFrontendFiles(todoList) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/artifacts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ TodoList: todoList.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("TodoList");

  fs.writeFileSync(
    contractsDir + "/TodoList.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });