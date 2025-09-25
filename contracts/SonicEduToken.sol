// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract SonicEduToken is ERC20, Ownable {
  constructor(string memory _name, string memory _symbol,uint _initialSupply) ERC20(_name, _symbol) Ownable(msg.sender) {
    _mint(msg.sender, _initialSupply);
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }
}

