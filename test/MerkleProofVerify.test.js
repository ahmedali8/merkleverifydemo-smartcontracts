require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");
const { deployContract } = require("../utils/utils.js");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { expect } = require("chai");

describe("MerkleProofVerify", () => {
  let accounts, merkleProof;
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    merkleProof = await deployContract(accounts[0], "MerkleProofVerify", []);
  });

  describe("OZ:verify", function () {
    it("returns true for a valid Merkle proof", async function () {
      const elements =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split(
          ""
        );
      const merkleTree = new MerkleTree(elements, keccak256, {
        hashLeaves: true,
        sortPairs: true,
      });

      const root = merkleTree.getHexRoot();

      const leaf = keccak256("A");

      const proof = merkleTree.getHexProof(leaf);

      // console.log(
      //   `await merkleProof.verify(proof, root, leaf)`,
      //   (await merkleProof.estimateGas.verify(proof, root, leaf))?.toString()
      // );
      expect(await merkleProof.verify(proof, root, leaf)).to.equal(true);
    });

    it("returns false for an invalid Merkle proof", async function () {
      const correctElements = ["a", "b", "c"];
      const correctMerkleTree = new MerkleTree(correctElements, keccak256, {
        hashLeaves: true,
        sortPairs: true,
      });

      const correctRoot = correctMerkleTree.getHexRoot();

      const correctLeaf = keccak256(correctElements[0]);

      const badElements = ["d", "e", "f"];
      const badMerkleTree = new MerkleTree(badElements);

      const badProof = badMerkleTree.getHexProof(badElements[0]);

      expect(
        await merkleProof.verify(badProof, correctRoot, correctLeaf)
      ).to.equal(false);
    });

    it("returns false for a Merkle proof of invalid length", async function () {
      const elements = ["a", "b", "c"];
      const merkleTree = new MerkleTree(elements, keccak256, {
        hashLeaves: true,
        sortPairs: true,
      });

      const root = merkleTree.getHexRoot();

      const leaf = keccak256(elements[0]);

      const proof = merkleTree.getHexProof(leaf);
      const badProof = proof.slice(0, proof.length - 5);

      expect(await merkleProof.verify(badProof, root, leaf)).to.equal(false);
    });
  });

  describe("real test", () => {
    it("returns true for correct proof", async () => {
      const root =
        "0x07fb971416ab526be603fbcaa86d186f067bc415134984215739bcca61e79c1b";
      const proof = [
        "0x6852dfab2550a1bfa2ad8bd7ef34cc9e4a404a7a307386914e141118e6d0e62f",
        "0xae62ddab47350534305f403cb1f6f43aad487752af011cfccc4b78ea6b8cebb1",
        "0x840fb453b42a717d0d85746bf60360b7292063f7e829ef0eabc9843647643fe3",
        "0xd9433eb8da9a637bd6b9a9ec33e27e202e704cb67fbece81ca5b4978e7f10e52",
        "0x8bfa8580a69d3d653d95cef473c1e0018e2f10df10eb943974bccaa352722d68",
        "0x06d44b655bb2429ef9697db167a9c4b066afcd96d20de152e2f872c521a49d3a",
        "0x7619466a6114ad4f5cc68d017dee79ae317eb6599d0baac9209eab460da40e33",
      ];
      const leaf = keccak256("0x162F49fE6F365d04Db07F77377699aeFE2E8A2cf");

      expect(await merkleProof.verify(proof, root, leaf)).to.equal(true);
    });
  });
});
