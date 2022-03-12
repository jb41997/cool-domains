const main = async () => {
  // The first return is the deployer, the second is a random account
  const [owner, randomPerson] = await hre.ethers.getSigners();

  // original Domain contract factory
  const v1ContractFactory = await hre.ethers.getContractFactory('Domains_v1');
  // v2 Domain contract factory
  const v2ContractFactory = await hre.ethers.getContractFactory('Domains_v2');

  // deployProxy instead of standard deploy
  const v1Contract = await hre.upgrades.deployProxy(v1ContractFactory, ["pitty"], {kind: 'uups'});
  await v1Contract.deployed();

  // Just checking price on version 1
  console.log("v1 price:",await v1Contract.price("gusgus"))

  // Just checking the addresses on the v1Contract
  console.log("Contract deployed to:", v1Contract.address);
  console.log("Contract deployed by:", owner.address);
  
/*   
  Next const just demonstrates calling a function in the new version immediatly after upgrade,
  behavior imitates a constructor or the original initializer. (note the 3rd paramter) 
  Valuable since you cannot actually override the original initialize function.
  **Domains_v2.sol no longer has an initialize2 function so this wont work without modification.
  
  const v2Contract = await hre.upgrades.upgradeProxy(v1Contract, domainV2ContractFactory, {call: {fn: 'initialize2', args:["ninja"]}});
 */

  // upgrade to v2
  const v2Contract = await hre.upgrades.upgradeProxy(v1Contract, v2ContractFactory);
  await v2Contract.deployed()
  // check v2 price *note using the v1Contract*. Should be able to use v2Contract here as well,
  // but post-upgrade they should both show the same thing, assuming there was a price function
  // in v1.
  console.log("v2 price:", await v1Contract.price("gusgus"))

  console.log("Contract Version:", await v1Contract.version())
  console.log("######################")

  // We're passing in a second variable - value. This is the moneyyyyyyyyyy
  let txn = await v1Contract.register("gusgus",  {value: hre.ethers.utils.parseEther('0.3')});
  await txn.wait();

  // get address for gusgus domain
  const domainAddress = await v1Contract.getAddress("gusgus");
  console.log("Owner of domain gus:", domainAddress);

  // Trying to set a record that doesn't belong to me!
  // txn = await v1Contract.connect(randomPerson).setRecord("doom", "Haha my domain now!");
  // await txn.wait();

  // Get contract balance
  const balance = await hre.ethers.provider.getBalance(v1Contract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}
  
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