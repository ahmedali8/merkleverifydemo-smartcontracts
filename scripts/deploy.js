const {
  etherBalanceString: etherBalanceStr,
  deployContract,
  logGas,
  verifyContract,
} = require("../utils/utils.js");

async function main() {
  const { chainId, name } = await ethers.provider.getNetwork();
  const [owner] = await ethers.getSigners();

  console.log(`Connected to name: ${name} & chainId: ${chainId}`);
  console.log(`Deploying contracts with the account: ${owner.address}`);
  console.log(`Owner balance: ${await etherBalanceStr(owner.address)}`);

  const args = [];
  const contract = await deployContract(owner, "MerkleProofVerify", args);
  const tx = contract.deployTransaction;
  await logGas(tx);

  if (chainId != 31337 && chainId != 1337) {
    await verifyContract(contract.address, args, tx);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
