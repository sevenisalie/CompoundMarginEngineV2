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
    await scrape.loadAccountsLiquidity()

    console.log("Fin")
    console.log(scrape.borrowerLiquidity.length)
    return
}

main()