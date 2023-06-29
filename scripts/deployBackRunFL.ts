import { ethers, run } from "hardhat";
import dotenv from 'dotenv'

dotenv.config()

async function main() {

    const BackRunFactory = await ethers.getContractFactory("BlindBackrunFL");
    const BackRun = await BackRunFactory.deploy("0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619");

    await BackRun.deployed();

    //   await run("verify:verify", {
    //     address: "0x55e364e365363c0107cfa398b73b5014ba8860de",
    //     constructorArguments: [
    //     ],
    //   });

    console.log(
        `BackRun deployed to ${BackRun.address}
    ***************************************************
    Backrun verified on etherscan with name Backrun
    `
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
