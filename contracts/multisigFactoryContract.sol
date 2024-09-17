// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./multisig.sol";

contract MultisigFactory {

    Multisig[] multisigClones;

    function createMultisigWallet(uint256 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_) {

        newMulsig_ = new Multisig(uint8(_quorum), _validSigners);

        multisigClones.push(newMulsig_);

        length_ = multisigClones.length;
    }

    function getMultiSigClones() external view returns(Multisig[] memory) {
        return multisigClones;
    }
}