const main = async () => {
    // v1 Domain contract factory
    const v1ContractFactory = await hre.ethers.getContractFactory('Domains_v1');
    // deploy proxy instead of standard deploy
    const v1Contract = await hre.upgrades.deployProxy(v1ContractFactory, ["pibble"], {kind: 'uups'});
    await v1Contract.deployed();
 
    console.log("Contract deployed to: ", v1Contract.address);
    console.log("Contract Version: ", await v1Contract.version())
  
    let txn = await v1Contract.register("gusgus",  {value: hre.ethers.utils.parseEther('0.1')});
    await txn.wait();
    console.log("Minted domain gusgus.pibble")

    txn = await v1Contract.setRecord("gusgus", "Am I a gusgus or a pibble??");
    await txn.wait();
    console.log("Set record for gusgus.pibble");
  
    const domainAddress = await v1Contract.getAddress("gusgus");
    console.log("Owner of domain gusgus:", domainAddress);

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