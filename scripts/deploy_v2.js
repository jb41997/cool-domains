const main = async () => {
    // v1 Proxy Contract Address
    const PROXY_ADDRESS = "0x65F9e948cf62609BDd12f2d7A0B629B92183CF82"

    // v2 Domain contract 
    const v2ContractFactory = await hre.ethers.getContractFactory('Domains_v2');

    // Just to check the version prior to upgrade
    const v1Contract = await hre.ethers.getContractAt("Domains_v1",PROXY_ADDRESS);
    console.log("Version Prior To Upgrade: ",await v1Contract.version())

    // Upgrade!
    const domainV2Contract = await hre.upgrades.upgradeProxy(PROXY_ADDRESS, v2ContractFactory);
    await domainV2Contract.deployed()

    // Check version post upgrade
    console.log("Version Post Upgrade: ", await v1Contract.version())

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