import { ethers } from "hardhat"
import Scrapinator, { Multicall } from "./scrape"
const signature = "function getAccountLiquidity(address account) public view returns (uint256, uint256, uint256)"
const main = async () => {
    const scrape = new Scrapinator()
    await scrape.init()
    console.log(scrape.initialization)
    // console.log((await scrape.fetchUserLiquidity("0xAEFac7De344509cc05fB806898E18C8B8bD0024c")))
    // const response = await scrape.fetchAllUserLiquidity()
    const data = scrape.borrowerAddresses as any[]
    const signer = (await ethers.getSigners())[0]
    const multiCtr = await ethers.getContractAt("MultiCall", "0x55e364e365363c0107cfa398b73b5014ba8860de", signer)
    const multi = new Multicall(signer, scrape.comptroller, [signature], multiCtr)
    const calldata = data.map((d, i) => {
        return {
            params: [d],
            userAddress: d
        }
    })
    const calls = await multi.batchCalls(calldata)
    console.log("Fin")
    console.log(calls)
    return
}

main()