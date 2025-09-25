import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "sepolia",
});

async function main() {
  console.log("starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  if (deployer.provider) {
    console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  }
  const initialSupply = ethers.parseEther("1000000");
  // Deploy token
  const Token = await ethers.getContractFactory("SonicEduToken");
  const token = await Token.deploy("SonicEduToken", "SET", initialSupply);
  await token.waitForDeployment();
  console.log("Token deployed to:", token.target);

  // Deploy tracker
  const Tracker = await ethers.getContractFactory("CourseCompletionTracker");
  const tracker = await Tracker.deploy(token.target);
  await tracker.waitForDeployment();
  console.log("Tracker deployed to:", tracker.target);

  // Fund tracker
  const fundAmount = ethers.parseEther("10000");
  console.log(`minting ${fundAmount} tokens to tracker...`);
  await token.mint(tracker.target, fundAmount);
  console.log("Deployment complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
