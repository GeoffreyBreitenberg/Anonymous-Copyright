import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Hardhat tasks for interacting with the AnonymousCopyright contract
 *
 * Usage:
 *   npx hardhat copyright:register-author --author-id 123456
 *   npx hardhat copyright:register-work --hash 42 --title "My Work" --category "Art"
 *   npx hardhat copyright:get-stats --address 0x...
 */

/**
 * Register an author
 *
 * Example: npx hardhat copyright:register-author --author-id 123456 --network sepolia
 */
task("copyright:register-author", "Register as an anonymous author")
  .addParam("authorId", "Numeric author identifier (will be encrypted)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    console.log(`Registering author with ID: ${taskArgs.authorId}`);
    console.log(`Signer address: ${signer.address}`);

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    // Check if already registered
    const isRegistered = await contract.isRegisteredAuthor(signer.address);
    if (isRegistered) {
      console.log("❌ Already registered as author");
      return;
    }

    const tx = await contract.connect(signer).registerAuthor(BigInt(taskArgs.authorId));
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Author registered successfully! (Block: ${receipt?.blockNumber})`);
  });

/**
 * Register a work
 *
 * Example: npx hardhat copyright:register-work --hash 42 --title "My Novel" --category "Literature"
 */
task("copyright:register-work", "Register a copyrighted work")
  .addParam("hash", "Content hash (uint32)")
  .addParam("title", "Work title")
  .addParam("category", "Work category (Literature, Music, Art, etc.)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    console.log(`Registering work: "${taskArgs.title}"`);
    console.log(`Category: ${taskArgs.category}`);
    console.log(`Content hash: ${taskArgs.hash}`);

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    // Check if author is registered
    const isRegistered = await contract.isRegisteredAuthor(signer.address);
    if (!isRegistered) {
      console.log("❌ You must register as an author first");
      console.log("   Run: npx hardhat copyright:register-author --author-id <id>");
      return;
    }

    const tx = await contract.connect(signer).registerWork(
      BigInt(taskArgs.hash),
      taskArgs.title,
      taskArgs.category
    );
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    const totalWorks = await contract.getTotalWorks();

    console.log(`✅ Work registered successfully! (Block: ${receipt?.blockNumber})`);
    console.log(`   Work ID: ${totalWorks.toString()}`);
  });

/**
 * Get author statistics
 *
 * Example: npx hardhat copyright:get-stats --address 0x1234...
 */
task("copyright:get-stats", "Get author statistics")
  .addParam("address", "Author address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    const stats = await contract.getAuthorStats(taskArgs.address);

    console.log(`\nAuthor Statistics for ${taskArgs.address}:`);
    console.log(`  Registered: ${stats.registered}`);
    console.log(`  Works Count: ${stats.workCount.toString()}`);
    console.log(`  Total Disputes: ${stats.totalDisputes.toString()}`);
    console.log(`  Won Disputes: ${stats.wonDisputes.toString()}`);

    if (stats.registered) {
      const works = await contract.getAuthorWorks(taskArgs.address);
      console.log(`\n  Registered Work IDs:`);
      works.forEach((workId: bigint, index: number) => {
        console.log(`    ${index + 1}. Work #${workId.toString()}`);
      });
    }
  });

/**
 * Get work information
 *
 * Example: npx hardhat copyright:get-work --id 1
 */
task("copyright:get-work", "Get work information")
  .addParam("id", "Work ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    const info = await contract.getWorkInfo(taskArgs.id);

    console.log(`\nWork #${taskArgs.id} Information:`);
    console.log(`  Title: ${info.title}`);
    console.log(`  Category: ${info.category}`);
    console.log(`  Registrant: ${info.registrant}`);
    console.log(`  Timestamp: ${new Date(Number(info.timestamp) * 1000).toLocaleString()}`);
    console.log(`  Verified: ${info.verified}`);
    console.log(`  Disputed: ${info.disputed}`);
    console.log(`  Dispute Count: ${info.disputeCount.toString()}`);
  });

/**
 * File a dispute
 *
 * Example: npx hardhat copyright:file-dispute --work-id 1 --hash 42
 */
task("copyright:file-dispute", "File a dispute against a work")
  .addParam("workId", "Work ID to dispute")
  .addParam("hash", "Your content hash (uint32)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    console.log(`Filing dispute for work #${taskArgs.workId}`);
    console.log(`Challenger hash: ${taskArgs.hash}`);

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    // Check if author is registered
    const isRegistered = await contract.isRegisteredAuthor(signer.address);
    if (!isRegistered) {
      console.log("❌ You must register as an author first");
      return;
    }

    // Get work info
    const workInfo = await contract.getWorkInfo(taskArgs.workId);
    if (workInfo.registrant.toLowerCase() === signer.address.toLowerCase()) {
      console.log("❌ Cannot dispute your own work");
      return;
    }

    const tx = await contract.connect(signer).fileDispute(
      taskArgs.workId,
      BigInt(taskArgs.hash)
    );
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    const disputeCount = await contract.getDisputeCount(taskArgs.workId);

    console.log(`✅ Dispute filed successfully! (Block: ${receipt?.blockNumber})`);
    console.log(`   Dispute ID: ${Number(disputeCount) - 1}`);
  });

/**
 * Get contract info
 *
 * Example: npx hardhat copyright:info
 */
task("copyright:info", "Get contract information").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;

    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    const owner = await contract.owner();
    const totalWorks = await contract.getTotalWorks();

    console.log(`\nAnonymousCopyright Contract Information:`);
    console.log(`  Address: ${deployment.address}`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Total Works: ${totalWorks.toString()}`);
    console.log(`  Network: ${hre.network.name}`);
    console.log(`  Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  }
);
