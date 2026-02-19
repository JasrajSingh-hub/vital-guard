const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with wallet:", deployer.address);

  const HealthRecordRegistry = await ethers.getContractFactory("HealthRecordRegistry");
  const registry = await HealthRecordRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  console.log("HealthRecordRegistry deployed at:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
