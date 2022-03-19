const main = async () => {
  // The first return is the deployer, the second is a random account
  const [owner, superCoder] = await hre.ethers.getSigners();

  // Library deploy
  const genSvgLibFactory = await hre.ethers.getContractFactory('GenSVG');
  const genSvgLibContract = await genSvgLibFactory.deploy()
  await genSvgLibContract.deployed()
  // original Domain contract factory
  const v1ContractFactory = await hre.ethers.getContractFactory('Domains_v1',{
    libraries: {
      GenSVG: genSvgLibContract.address,
    }
  });
  // v2 Domain contract factory
  const v2ContractFactory = await hre.ethers.getContractFactory('Domains_v2',{
    libraries: {
      GenSVG: genSvgLibContract.address,
    }
  });

  // deployProxy instead of standard deploy
  const v1Contract = await hre.upgrades.deployProxy(v1ContractFactory,
     ["pitty"], 
     {
       unsafeAllow: ["external-library-linking"],
       kind: 'uups'
      });
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
  const v2Contract = await hre.upgrades.upgradeProxy(v1Contract, 
    v2ContractFactory,
    {
      unsafeAllow: ["external-library-linking"]
     });
  await v2Contract.deployed()

  console.log("Contract Version:", await v1Contract.version())


  // check v2 price *note using the v1Contract*. Should be able to use v2Contract here as well,
  // but post-upgrade they should both show the same thing, assuming there was a price function
  // in v1.
  console.log("v2 price:", await v1Contract.price("gusgus"))

  console.log("Contract Version:", await v1Contract.version())
  console.log("######################")

  // We're passing in a second variable - value. This is the moneyyyyyyyyyy
  let txn = await v1Contract.register("gusgus",  {value: hre.ethers.utils.parseEther('12')});
  await txn.wait();

  // get address for gusgus domain
  const domainAddress = await v1Contract.getAddress("gusgus");
  console.log("Owner of domain gusgus:", domainAddress);

  // Get contract balance
  const balanceFirst = await hre.ethers.provider.getBalance(v1Contract.address);
  console.log("First contract balance check:", hre.ethers.utils.formatEther(balanceFirst));

  // Quick! Grab the funds from the contract! (as superCoder)
  try {
    txn = await v1Contract.connect(superCoder).withdraw();
    await txn.wait();
  } catch(error){
    console.log("Could not rob contract");
    //console.log(error)
  }

  // Let's look in their wallet so we can compare later
  let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

  // Oops, looks like the owner is saving their money!
  txn = await v1Contract.connect(owner).withdraw();
  await txn.wait();
  
  // Fetch balance of contract & owner
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));  
  
  // Get contract balance
  const balanceSecond = await hre.ethers.provider.getBalance(v1Contract.address);
  console.log("Second contract balance check:", hre.ethers.utils.formatEther(balanceSecond));
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