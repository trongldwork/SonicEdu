import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CourseCompletionTracker", function () {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let token: any;
  let tracker: any;
  const initialSupply = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("SonicEduToken");
    token = await Token.deploy("SonicEduToken", "SET", initialSupply);
    await token.waitForDeployment();

    const Tracker = await ethers.getContractFactory("CourseCompletionTracker");
    tracker = await Tracker.deploy(token.target);
    await tracker.waitForDeployment();

    // Fund tracker with tokens for rewards
    await token.transfer(tracker.target, ethers.parseEther("10000"));
  });

  it("should deploy with correct token address", async function () {
    expect(await tracker.tokenAddress()).to.equal(token.target);
  });

  describe("addCourse", function () {
    it("owner can add a course and event is emitted", async function () {
      const reward = ethers.parseEther("1000");
      await expect(tracker.addCourse(1, reward))
        .to.emit(tracker, "CourseAdded")
        .withArgs(1, reward);

      expect(await tracker.courseRewards(1)).to.equal(reward);
    });

    it("owner cannot add the same course twice", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);
      await expect(tracker.addCourse(1, reward)).to.be.revert(ethers);
    });

    it("owner cannot add a course with zero reward", async function () {
      await expect(tracker.addCourse(2, 0)).to.be.revert(ethers);
    });

    it("non-owner cannot add course", async function () {
      await expect(tracker.connect(addr1).addCourse(2, ethers.parseEther("10"))).to.be.revert(ethers);
    });

  });

  describe("markCompletion", function () {
    it("owner can mark completion and event is emitted", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);

      await expect(tracker.markCompletion(addr1.address, 1))
        .to.emit(tracker, "CompletionMarked")
        .withArgs(addr1.address, 1);

      // Finished = 1 in enum
      expect(await tracker.courseCompletions(addr1.address, 1)).to.equal(1);
    });

    it("cannot mark completion for non-existent course", async function () {
      await expect(tracker.markCompletion(addr1.address, 99)).to.be.revert(ethers);
    });

    it("cannot mark completion twice for same course and student", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);

      await tracker.markCompletion(addr1.address, 1);
      await expect(tracker.markCompletion(addr1.address, 1)).to.be.revert(ethers);
    });

    it("non-owner cannot mark completion", async function () {
      await expect(tracker.connect(addr1).markCompletion(addr1.address, 1)).to.be.revert(ethers);
    });
  });

  describe("claimReward", function () {
    it("student claims reward only after completion, token balance updates", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);

      // Claiming before completion reverts
      await expect(tracker.connect(addr1).claimReward(1)).to.be.revert(ethers);

      // Mark completion and then claim
      await tracker.markCompletion(addr1.address, 1);

      const before = await token.balanceOf(addr1.address);
      await expect(tracker.connect(addr1).claimReward(1))
        .to.emit(tracker, "RewardClaimed")
        .withArgs(addr1.address, 1, reward);

      const after = await token.balanceOf(addr1.address);
      expect(after - before).to.equal(reward);
    });

    it("cannot claim reward for non-existent course", async function () {
      await expect(tracker.connect(addr1).claimReward(99)).to.be.revert(ethers);
    });
    
    it("cannot claim reward without completion", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);
      await expect(tracker.connect(addr1).claimReward(1)).to.be.revert(ethers);
    });

    it("cannot claim reward twice", async function () {
      const reward = ethers.parseEther("1000");
      await tracker.addCourse(1, reward);
      await tracker.markCompletion(addr1.address, 1);
      await tracker.connect(addr1).claimReward(1);
      await expect(tracker.connect(addr1).claimReward(1)).to.be.revert(ethers);
    });

    it("insufficient contract token balance prevents claiming", async function () {
      const reward = ethers.parseEther("20000"); // More than funded
      await tracker.addCourse(1, reward);
      await tracker.markCompletion(addr1.address, 1);
      await expect(tracker.connect(addr1).claimReward(1)).to.be.revert(ethers);
    });

  });
  

  describe("withdrawTokens", function () {
    it("only owner can withdraw tokens and balances update", async function () {
      const withdrawAmount = ethers.parseEther("500");

      const ownerBefore = await token.balanceOf(owner.address);

      // Non-owner cannot withdraw
      await expect(tracker.connect(addr1).withdrawTokens(withdrawAmount)).to.be.revert(ethers);

      // Owner withdraws
      await expect(tracker.withdrawTokens(withdrawAmount))
        .to.emit(tracker, "TokensWithdrawn")
        .withArgs(owner.address, withdrawAmount);

      const ownerAfter = await token.balanceOf(owner.address);
      expect(ownerAfter - ownerBefore).to.equal(withdrawAmount);
    });

    it("cannot withdraw more than contract balance", async function () {
      const excessiveAmount = ethers.parseEther("20000"); // More than funded
      await expect(tracker.withdrawTokens(excessiveAmount)).to.be.revert(ethers);
    });

    it("cannot withdraw zero tokens", async function () {
      await expect(tracker.withdrawTokens(0)).to.be.revert(ethers);
    });

    it("non-owner cannot withdraw tokens", async function () {
      await expect(tracker.connect(addr1).withdrawTokens(ethers.parseEther("10"))).to.be.revert(ethers);
    });
  });

});
