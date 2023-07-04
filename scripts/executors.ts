import { ethers } from "hardhat"
import Scrapinator, { Multicall } from "./scrape"
import { Liquiditinator, Snipinator, Trade } from "./sniper"
import Databasinator from "./database"
import { Listenator } from "./listener"
import { functionSelectors, v2Markets, BackRunFLContract, tokens, transactionParams, UniswapV2PairABI } from "./config/consts"
import v2RouterAbi from "./config/v2RouterAbi.json"
import { TransactionResponse } from "@ethersproject/providers"
import { logError, logInfo } from "./logging"
import { Interface } from "@ethersproject/abi"
import { checkPairsForWeth } from "./executorUtils"
import { Poolinator } from "./v2pools"

export const syncExecutor = (txHash: string) => {
    const factories = v2Markets.map(market => market.factory.toLowerCase())
    const routers = v2Markets.map(market => market.router.toLowerCase())
    const selectors: any = functionSelectors
    const provider = new ethers.providers.JsonRpcProvider(process.env.HTTPS_RPC_URL as any)
    const v2PairInterface = new Interface(UniswapV2PairABI)
    const poolinator = new Poolinator(provider, 137)

    try {
        provider.getTransaction(txHash).then(async (t: TransactionResponse) => {
            if (t) {
                if (!t.to) { return } //easy invariant to stop simming fast
                if (t.to.toLowerCase() == (v2Markets.find((market) => { return market.name == "QUICKSWAP" }) as any).router.toLowerCase()) {
                    const rc = await t.wait() //sometimes the opponents transaction will fail and not get mined, oh well
                    if (!(((rc.logs.map((log) => log.topics)).flat()).includes(ethers.utils.id("Sync(uint112,uint112)")))) { return }
                    const syncLogs = rc.logs.filter((log) => log.topics.includes(ethers.utils.id("Sync(uint112,uint112)")))

                    try {
                        const decodedLogs = syncLogs.map((log) => ethers.utils.defaultAbiCoder.decode(["uint112", "uint112"], log.data))
                        const data = decodedLogs.map((decodedLog, i) => {
                            return {
                                pair: syncLogs[i].address,
                                reserves: {
                                    token0: decodedLog[0],
                                    token1: decodedLog[1]
                                }
                            }
                        })

                        const pairs = data.map((entry) => entry.pair)
                        const pairDataPromises = await checkPairsForWeth(provider, pairs)

                        console.log("clientSide PairData", pairDataPromises)
                    } catch (error) {
                        // logInfo("Get Decoded Logs Error", error)
                        console.log(error)
                    }
                }
            } else {
                return
            }
        }
        ).catch(
            err => logError("Opponent Transaction Ended Up Failing/Reverting", err.reason)
        )
    } catch (err) {
        logInfo("Error Getting Transaction from Provider", err)
    }

}