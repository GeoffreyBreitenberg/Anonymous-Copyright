import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying ExampleContract...");

  const deployment = await deploy("ExampleContract", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(`ExampleContract deployed to: ${deployment.address}`);
};

export default func;
func.tags = ["ExampleContract"];
