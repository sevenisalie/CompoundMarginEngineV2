import { ethers } from "hardhat"
import Scrapinator, { Multicall } from "./scrape"
import { Liquiditinator, Snipinator, Trade } from "./sniper"
import Databasinator from "./database"
import { Listenator } from "./listener"
import { functionSelectors, v2Markets, BackRunFLContract, tokens, transactionParams, UniswapV2PairABI } from "./config/consts"
import v2RouterAbi from "./config/v2RouterAbi.json"
import { TransactionResponse } from "@ethersproject/providers"
import { logInfo } from "./logging"
import { Interface } from "@ethersproject/abi"
const signature = "function getAccountLiquidity(address account) public view returns (uint256, uint256, uint256)"

const main = async () => {
    const signer = (await ethers.getSigners())[0]
    const qrouter = new ethers.Contract("0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", v2RouterAbi)
    // const snipe = new Snipinator(signer, "0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57")
    // const pair = (snipe.fetchAllPairs()[0])
    // console.log(pair)
    // const p = new Trade("0.01", "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9", "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", 4, signer)
    // const p2in = ethers.utils.formatUnits((await p.getAmountIn()), p.tokenOut.decimals)
    // const p2 = new Trade(p2in, "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035", 4, signer)
    // const p3in = ethers.utils.formatUnits((await p2.getAmountIn()), p2.tokenOut.decimals)
    // const p3 = new Trade(p3in, "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035", "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9", 4, signer)
    // const r3 = await p3.getAmountIn()

    // const l = p.path

    // console.log("*************** CLIENT SIDE ********************")

    // console.log(r3)
    // return

    const syncExecutor = (txHash: string) => {
        const factories = v2Markets.map(market => market.factory.toLowerCase())
        const routers = v2Markets.map(market => market.router.toLowerCase())
        const selectors: any = functionSelectors
        const provider = new ethers.providers.JsonRpcProvider(process.env.HTTPS_RPC_URL as any)
        const v2PairInterface = new Interface(UniswapV2PairABI)

        try {
            provider.getTransaction(txHash).then(async (t: TransactionResponse) => {
                console.log((v2Markets.find((market) => (market.name == "QUICKSWAP")) as any).router.toLowerCase())
                if (t) {
                    if (!t.to) { return }
                    if (t.to.toLowerCase() == (v2Markets.find((market) => { return market.name == "QUICKSWAP" }) as any).router.toLowerCase()) {
                        const rc = await t.wait()
                        if (!(((rc.logs.map((log) => log.topics)).flat()).includes(ethers.utils.id("Sync(uint112,uint112)")))) { return }
                        console.log("FOUND POTENTIAL TRADE SYNC SITUTATION")
                        const syncLogs = rc.logs.filter((log) => log.topics.includes(ethers.utils.id("Sync(uint112,uint112)")))
                        console.log("Sync logs")
                        console.log(syncLogs)
                        try {
                            const decodedLogs = syncLogs.map((log) => ethers.utils.defaultAbiCoder.decode(["uint112", "uint112"], log.data))
                            console.log("logs")

                            const data = decodedLogs.map((decodedLog, i) => {
                                return {
                                    pair: syncLogs[i].address,
                                    reserves: {
                                        token0: decodedLog[0],
                                        token1: decodedLog[1]
                                    }
                                }
                            })
                            console.log(data)
                        } catch (error) {
                            logInfo(error)
                        }
                    }
                } else {
                    console.log("fuck up1")
                }
            }
            )
        } catch (err) {
            logInfo(err)
        }

    }

    const L = new Listenator(qrouter, "Sync(uint112,uint112)", syncExecutor)
    L.onPending()
}

main()