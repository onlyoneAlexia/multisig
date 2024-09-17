
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

interface IMultisig {

     function transfer(uint256 _amount, address _recipient, address _tokenAddress) external;
     
     function approveTx(uint8 _txId) external;

     function updateNewQuorum(uint8 _newQuorum) external;

     function approveNewQuorum(uint8 _txId) external;
}
