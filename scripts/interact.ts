import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const [owner, student] = await ethers.getSigners();

  // Deploy token
  const Token = await ethers.getContractFactory("SonicEduToken");
  const token = await Token.deploy("SonicEduToken", "SET", ethers.parseEther("1000000"));
  await token.waitForDeployment();
  console.log("Token deployed to:", token.target);

  // Deploy tracker
  const Tracker = await ethers.getContractFactory("CourseCompletionTracker");
  const tracker = await Tracker.deploy(token.target);
  await tracker.waitForDeployment();
  console.log("Tracker deployed to:", tracker.target);

  // mint tokens to tracker
  const fundAmount = ethers.parseEther("10000");
  console.log(`minting ${fundAmount} tokens to tracker...`);
  await token.mint(tracker.target, fundAmount);

  // Owner adds a course
  const courseId = 1;
  const reward = ethers.parseEther("1000");
  console.log("Owner adding course", courseId, "with reward", reward.toString());
  await tracker.addCourse(courseId, reward);

  // Owner marks completion for student
  console.log("Owner marking completion for student", student.address, "for course", courseId);
  await tracker.markCompletion(student.address, courseId);

  // Student claims reward
  const before = await token.balanceOf(student.address);
  console.log("Student balance before claim:", before.toString());

  console.log("Student claiming reward...");
  await tracker.connect(student).claimReward(courseId);

  const after = await token.balanceOf(student.address);
  console.log("Student balance after claim:", after.toString());
  console.log("Received:", (after - before).toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});