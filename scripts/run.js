const main = async () => {

  // In order to deploy something to the blockchain, we need to have a wallet address.
  // First line grabs atomatically created address of an owner and a user of smart contract
  // const [owner, randomPerson] = await hre.ethers.getSigners();

  const bandContractFactory = await hre.ethers.getContractFactory("BandRecommendation");
  const bandContract = await bandContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });

  await bandContract.deployed();

  console.log("Contract deployed to:", bandContract.address);
  // console.log("Contract deployed by:", owner.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    bandContract.address
  );

  console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

  let bandCount;
  bandCount = await bandContract.getTotalRecommendations();
  console.log(bandCount.toNumber());

  // Sending test recommendations

  let bandTxn = await bandContract.recommend("Opeth");
  await bandTxn.wait(); // Waiting for the transaction to be minted

  // Check balance after first transaction

  contractBalance = await hre.ethers.provider.getBalance(bandContract.address);
  console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

  const [_, randomPerson] = await hre.ethers.getSigners();
  bandCount = await bandContract.connect(randomPerson).recommend("Tesseract");
  await bandTxn.wait();

  // trying to cheat

  bandTxn = await bandContract.recommend("Gojira");
  await bandTxn.wait();
  contractBalance = await hre.ethers.provider.getBalance(bandContract.address);
  console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

  // Check balance after second transaction

  contractBalance = await hre.ethers.provider.getBalance(bandContract.address);
  console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance));

  // Lets see all recommendations

  let allRecommendations = await bandContract.getAllRecommendations();
  console.log(allRecommendations);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
