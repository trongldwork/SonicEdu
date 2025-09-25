import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SonicEduToken", function () {
  it("Should deploy the token contract with correct parameters", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SonicEduToken");
    const token = await Token.deploy("SonicEduToken", "SET", ethers.parseEther("1000000"));
    await token.waitForDeployment();

    expect(await token.name()).to.equal("SonicEduToken");
    expect(await token.symbol()).to.equal("SET");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });

  it("Should allow only owner to mint new tokens", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SonicEduToken");
    const token = await Token.deploy("SonicEduToken", "SET", ethers.parseEther("1000000"));
    await token.waitForDeployment();
    
    // Owner can mint
    await token.mint(addr1.address, ethers.parseEther("1000"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1001000"));

    // Non-owner cannot mint
    await expect(token.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))).to.be.revert(ethers);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1001000"));
  });
  
});
