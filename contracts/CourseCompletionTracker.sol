// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract CourseCompletionTracker is Ownable {

  address public tokenAddress;

  enum CourseStatus { NotFinished, Finished, Claimed }

  mapping(uint => uint) public courseRewards; // courseId => rewardAmount
  mapping(address => mapping(uint => CourseStatus)) public courseCompletions; // student => courseId => CourseStatus

  event CourseAdded(uint indexed courseId, uint rewardAmount);
  event CompletionMarked(address indexed student, uint indexed courseId);
  event RewardClaimed(address indexed student, uint indexed courseId, uint rewardAmount);
  event TokensWithdrawn(address indexed to, uint amount);


  constructor(address _tokenAddress) Ownable(msg.sender) {
    tokenAddress = _tokenAddress;
  }

  function addCourse(uint courseId, uint rewardAmount) public onlyOwner {
    require(courseRewards[courseId] == 0, "Course already exists");
    require(rewardAmount > 0, "Reward amount should be positive");
    courseRewards[courseId] = rewardAmount;
    emit CourseAdded(courseId, rewardAmount);
  }

  function markCompletion(address student, uint courseId) public onlyOwner {
    require(courseRewards[courseId] > 0, "Course does not exist");
    require(courseCompletions[student][courseId] ==  CourseStatus.NotFinished, "Course already completed or claimed by student");
    courseCompletions[student][courseId] = CourseStatus.Finished;
    emit CompletionMarked(student, courseId);
  }

  function claimReward(uint courseId) public {
    require(courseRewards[courseId] > 0, "Course does not exist");
    // Check if the caller has not done yet or already claimed the reward for that course
    require(courseCompletions[msg.sender][courseId] == CourseStatus.Finished, "Course not completed by student or already claimed");

    uint rewardAmount = courseRewards[courseId];
    courseCompletions[msg.sender][courseId] = CourseStatus.Claimed; // Prevent re-claiming

    // Transfer tokens to the student
    bool success = IERC20(tokenAddress).transfer(msg.sender, rewardAmount);
    require(success, "Token transfer failed while claiming reward");
    emit RewardClaimed(msg.sender, courseId, rewardAmount);
  }

  function withdrawTokens(uint amount) public onlyOwner {
    require(amount > 0, "Amount should be positive");
    bool success = IERC20(tokenAddress).transfer(msg.sender, amount);
    require(success, "Token transfer failed while withdrawing tokens");
    emit TokensWithdrawn(msg.sender, amount);
  }

  
}
