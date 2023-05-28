import { ethers } from "hardhat"
import Scrapinator, { Multicall } from "./scrape"
import { Snipinator } from "./sniper"
import Databasinator from "./database"
const signature = "function getAccountLiquidity(address account) public view returns (uint256, uint256, uint256)"
const main = async () => {
    const signer = (await ethers.getSigners())[0]
    const snipe = new Snipinator(signer, "0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57")
    const w = await snipe.detectNewPairs()
    console.log(w)

    return
}

main()