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

export const syncExecutor = (txHash: string) => {
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