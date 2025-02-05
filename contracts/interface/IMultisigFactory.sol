
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "../multisig.sol";

interface IMultisigFactory {

     function createMultisigWallet(uint256 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_);

     function getMultiSigClones() external view returns(Multisig[] memory) ;
     
}
