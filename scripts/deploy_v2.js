const main = async () => {
    // v1 Proxy Contract Address
    const PROXY_ADDRESS = "0xBe3265D9e8DAdfDD93201dbD5c93819d61fdEf76"
    const SVG_LIB_ADDRESS = "0x5E0A5906C0749C7C78010f6666a974C1e80F5d6D"

    // v2 Domain contract 
    const v2ContractFactory = await hre.ethers.getContractFactory('Domains_v2',{
        libraries: {
          GenSVG: SVG_LIB_ADDRESS,
        }
      });

    // Just to check the version prior to upgrade
    const v1Contract = await hre.ethers.getContractAt("Domains_v1",PROXY_ADDRESS);
    console.log("Version Prior To Upgrade: ",await v1Contract.version())

    // Upgrade!
    const domainV2Contract = await hre.upgrades.upgradeProxy(PROXY_ADDRESS, 
        v2ContractFactory,
        {
          unsafeAllow: ["external-library-linking"]
         });
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