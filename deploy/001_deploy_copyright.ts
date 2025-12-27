import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy AnonymousCopyright contract using hardhat-deploy plugin
 *
 * This deployment script:
 * - Deploys the contract to the configured network
 * - Tags the deployment for easy reference
 * - Verifies constructor parameters
 * - Logs deployment information
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  log("Deploying AnonymousCopyright contract...");
  log(`Deployer: ${deployer}`);

  const deployment = await deploy("AnonymousCopyright", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    autoMine: true, // Speed up deployment on local network (ganache, hardhat)
  });

  log(`AnonymousCopyright deployed at: ${deployment.address}`);
  log(`Deployment transaction: ${deployment.transactionHash}`);
  log(`Gas used: ${deployment.receipt?.gasUsed.toString()}`);

  // Verify owner is set correctly
  const contract = await hre.ethers.getContractAt("AnonymousCopyright", deployment.address);
  const owner = await contract.owner();
  log(`Contract owner: ${owner}`);
  log(`Owner matches deployer: ${owner.toLowerCase() === deployer.toLowerCase()}`);

  // Log initial state
  const totalWorks = await contract.getTotalWorks();
  log(`Initial total works: ${totalWorks.toString()}`);

  log("✅ Deployment complete!");
};

export default func;
func.tags = ["AnonymousCopyright", "copyright", "privacy"];
