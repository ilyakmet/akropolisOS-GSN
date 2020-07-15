// SPDX-License-Identifier: MIT

pragma solidity >=0.4.25 <0.7.0;

contract Counter {
    uint256 public value;

    function increase() public {
        value += 1;
    }
}
