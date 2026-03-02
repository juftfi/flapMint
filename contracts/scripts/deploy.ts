import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "BNB");

  const FlapMintNFT = await ethers.getContractFactory("FlapMintNFT");
  const nft = await FlapMintNFT.deploy();
  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log("FlapMintNFT deployed to:", address);
  console.log("\nUpdate these files with the new address:");
  console.log("  - src/lib/contract-addresses.ts");
  console.log("  - agent/config.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
