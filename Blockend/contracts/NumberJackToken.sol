// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error NumberJackToken__NotOwner();

contract NumberJackToken is ERC20 {

    address public immutable i_owner;

    constructor() ERC20("NumberJackToken", "NJT") {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        if(i_owner != msg.sender) revert NumberJackToken__NotOwner();
        _;
    }


    function mint(address gameAddress) public onlyOwner {
        _mint(gameAddress, 100000 * 10 ** 18);
    }
}
