import { ethers, run } from "hardhat";
import dotenv from 'dotenv'
dotenv.config()

async function main() {

  // const MulticallFactory = await ethers.getContractFactory("MultiCall");
  // const Multicall = await MulticallFactory.deploy();

  // await Multicall.deployed();

  await run("verify:verify", {
    address: "0x55e364e365363c0107cfa398b73b5014ba8860de",
    constructorArguments: [
    ],
  });

  console.log(
    `Multicall deployed to ${"0x55e364e365363c0107cfa398b73b5014ba8860de"}
    ***************************************************
    Multicall verified on etherscan with name Multicall
    `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
