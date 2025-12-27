import { ethers } from "hardhat";

/**
 * Deploy the AnonymousCopyright contract
 *
 * This script deploys the privacy-preserving copyright protection system
 * using Fully Homomorphic Encryption on the configured network.
 */
async function main() {
  console.log("Starting deployment of AnonymousCopyright contract...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("Deploying AnonymousCopyright...");
  const AnonymousCopyrightFactory = await ethers.getContractFactory("AnonymousCopyright");
  const contract = await AnonymousCopyrightFactory.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ AnonymousCopyright deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("\nNetwork:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);

  // Verify owner
  const owner = await contract.owner();
  console.log("\nContract owner:", owner);
  console.log("Owner matches deployer:", owner === deployer.address);

  // Display initial state
  const totalWorks = await contract.getTotalWorks();
  console.log("\nInitial state:");
  console.log("  Total works registered:", totalWorks.toString());

  console.log("\n📝 Save this information for verification:");
  console.log("  Contract Address:", contractAddress);
  console.log("  Deployer Address:", deployer.address);
  console.log("  Block Number:", await ethers.provider.getBlockNumber());

  console.log("\n🔗 Next steps:");
  console.log("  1. Verify contract on Etherscan:");
  console.log(`     npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("  2. Test contract interaction:");
  console.log(`     npx hardhat console --network sepolia`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
