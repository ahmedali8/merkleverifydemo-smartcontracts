const { utils } = require("ethers");
const { isAddress, getAddress } = utils;
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// interface MerkleDistributorInfo {
//   merkleRoot: string
//   claims: {
//     [account: string]: {
//       proof: string[]
//     }
//   }
// }

function parseAccountMap(accounts) {
  const accountArr = Array.isArray(accounts)
    ? accounts
    : Object.keys(accounts).map((account) => ({
        address: account,
      }));

  const dataByAddress = accountArr.reduce((memo, { address: account }) => {
    if (!isAddress(account)) {
      throw new Error(`Found invalid address: ${account}`);
    }
    const parsed = getAddress(account);
    if (memo[parsed]) throw new Error(`Duplicate address: ${parsed}`);

    memo.push(parsed);
    return memo;
  }, []);

  const sortedAddresses = dataByAddress.sort();

  // construct a tree
  const tree = new MerkleTree(sortedAddresses, keccak256, {
    hashLeaves: true,
    sortPairs: true,
  });

  // generate claim
  const claims = sortedAddresses.reduce((memo, address, index) => {
    const leaf = keccak256(address);
    memo[address] = {
      index,
      proof: tree.getHexProof(leaf, index),
    };
    return memo;
  }, {});

  return {
    merkleRoot: tree.getHexRoot(),
    totalCount: sortedAddresses.length,
    claims,
  };
}

module.exports = { parseAccountMap };
