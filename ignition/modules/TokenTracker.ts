import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";
export default buildModule("TokenTracker", (m) => {
  const initialSupply = ethers.parseEther("1000000");
  const token = m.contract("SonicEduToken", [
    "SonicEduToken",
    "SET",
    initialSupply,
  ]);

  const tracker = m.contract("CourseCompletionTracker", [token], {
    after: [token], // `tracker` is deployed after `token`
  });

  m.call(token, "transfer", [tracker, ethers.parseEther("700000")], {
    after: [token, tracker], // `transfer` is called after both `token` and `tracker` are deployed
  });

  return { token, tracker };
});
