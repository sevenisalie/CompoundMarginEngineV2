import { ethers } from "hardhat"
import Scrapinator, { Multicall } from "./scrape"
import { Liquiditinator, Snipinator, Trade } from "./sniper"
import Databasinator from "./database"
const signature = "function getAccountLiquidity(address account) public view returns (uint256, uint256, uint256)"
const main = async () => {
    const signer = (await ethers.getSigners())[0]
    // const snipe = new Snipinator(signer, "0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57")
    // const pair = (snipe.fetchAllPairs()[0])
    // console.log(pair)
    const p = new Trade("0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9", "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", 4, signer)
    const l = p.path
    const r = await p.getAmountIn()
    console.log("*************** CLIENT SIDE ********************")
    console.log(r)
    return
}

main()