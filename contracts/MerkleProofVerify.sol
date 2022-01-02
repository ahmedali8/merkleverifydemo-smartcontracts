// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleProofVerify {
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function processProof(bytes32[] memory proof, bytes32 leaf)
        public
        pure
        returns (bytes32)
    {
        return MerkleProof.processProof(proof, leaf);
    }
}
