import hre from "hardhat";
import TokenTrackerModule from "../ignition/modules/TokenTracker.js";

async function main() {
  const connection = await hre.network.connect();
  const { token, tracker } = await connection.ignition.deploy(TokenTrackerModule);
  const [deployer] = await connection.ethers.getSigners();

  console.log(`Token deployed to: ${await token.getAddress()}`);
  console.log(`Tracker deployed to: ${await tracker.getAddress()}`);
  console.log(`Deployer address: ${deployer.address}`);

  const deployerBalance = await token.balanceOf(deployer.address);
  const trackerBalance = await token.balanceOf(tracker.target);

  console.log("deployer balance:", connection.ethers.formatEther(deployerBalance), "SET");
  console.log("tracker balance:", connection.ethers.formatEther(trackerBalance), "SET");
}

main().catch(console.error);
