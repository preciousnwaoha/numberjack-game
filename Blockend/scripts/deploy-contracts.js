const hre = require("hardhat");

async function main() {

    const mintAmount = ethers.parseEther("2");

  const NumberJackTokenContract = await hre.ethers.getContractFactory("NumberJackToken");
  const numberJackTokenContract = await NumberJackTokenContract.deploy();
    
  const NumberJackGameContract = await hre.ethers.getContractFactory("NumberJackGame");
  const numberJackGameContract  = await NumberJackGameContract.deploy(numberJackTokenContract.target);


  await numberJackTokenContract.mint(numberJackGameContract.target, mintAmount);

  const balance = await numberJackTokenContract.balanceOf(numberJackGameContract.target);

  console.log(balance);

  console.log("NumberJack Token contract deployed to:", numberJackTokenContract.target);

  console.log("NumberJack game contract deployed to:", numberJackGameContract.target);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



// CORE: Support contract deployed to: 0x5Ac64F5DA22B25559C7D7522b4B2BB7e2012F382