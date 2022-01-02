const { program } = require("commander");
const fs = require("fs");
const { utils } = require("ethers");

program
  .version("0.0.0")
  .requiredOption(
    "-i, --input <path>",
    "input JSON file location containing the merkle proofs for each account and the merkle root"
  );

program.parse(process.argv);
const json = JSON.parse(fs.readFileSync(program.input, { encoding: "utf8" }));

const combinedHash = (first, second) => {
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }

  return Buffer.from(
    utils
      .solidityKeccak256(
        ["bytes32", "bytes32"],
        [first, second].sort(Buffer.compare)
      )
      .slice(2),
    "hex"
  );
};

const toNode = (account) => {
  return Buffer.from(
    utils.solidityKeccak256(["address"], [account]).slice(2),
    "hex"
  );
};

// returns boolean
const verifyProof = (
  account, // string
  proof, // Buffer[]
  root // Buffer
) => {
  let leaf = toNode(account);
  for (const item of proof) {
    leaf = combinedHash(leaf, item);
  }

  return leaf.equals(root);
};

const getNextLayer = (elements) => {
  return elements.reduce((layer, el, idx, arr) => {
    if (idx % 2 === 0) {
      // Hash the current element with its pair element
      layer.push(combinedHash(el, arr[idx + 1]));
    }

    return layer;
  }, []);
};

// returns Buffer
const getRoot = (accounts) => {
  let nodes = accounts.map(({ account }) => toNode(account));

  // deduplicate any eleents
  nodes = nodes.filter((el, idx) => {
    return idx === 0 || !nodes[idx - 1].equals(el);
  });

  const layers = [];
  layers.push(nodes);

  // Get next layer until we reach the root
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1]));
  }

  return layers[layers.length - 1][0];
};

if (typeof json !== "object") throw new Error("Invalid JSON");

const merkleRootHex = json.merkleRoot;
const merkleRoot = Buffer.from(merkleRootHex.slice(2), "hex");

let accounts = []; // [{ index, account }]
let valid = true;

Object.keys(json.claims).forEach((address) => {
  const claim = json.claims[address];
  const proof = claim.proof.map((p) => Buffer.from(p.slice(2), "hex"));
  accounts.push({ index: claim.index, account: address });
  if (verifyProof(address, proof, merkleRoot)) {
    console.log("Verified proof for", claim.index, address);
  } else {
    console.log("Verification for", address, "failed");
    valid = false;
  }
});

if (!valid) {
  console.error("Failed validation for 1 or more proofs");
  process.exit(1);
}
console.log("Done!");

// Root
const root = getRoot(accounts).toString("hex");
console.log("Reconstructed merkle root", root);
console.log(
  "Root matches the one read from the JSON?",
  root === merkleRootHex.slice(2)
);

// Both are same
// console.log("keccak256 >>> ", keccak256("A"));
// console.log(
//   "Buffer.from >>> ",
//   Buffer.from(utils.solidityKeccak256(["string"], ["A"]).slice(2), "hex")
// );
