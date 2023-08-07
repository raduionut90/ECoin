const token = artifacts.require("ECoin.sol");

module.exports = async function (deployer) {
    // Deploy ECoin.sol contract
    const totalSupply = "420689899999994000000000000000000"; // Adaugă 18 zecimale
    await deployer.deploy(token, totalSupply);
    const ecoinInstance = await token.deployed();

    // Additional actions after deployment
    console.log("ECoin contract deployed at address:", ecoinInstance.address);
    console.log("Total supply of ECoin:", totalSupply);
};
