import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("BlindBackrunFL");
    const lock = await Lock.deploy(WETH);
    const address = lock.address
    return { address };
}

describe("Deployment", function () {
    it("Deploy", async function () {
        const { address } = await loadFixture(deployOneYearLockFixture);

        expect(address.length).to.equal(42);
    });
})
