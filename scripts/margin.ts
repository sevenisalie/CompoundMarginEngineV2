import { ethers } from "hardhat"
import { functionSelectors, v2Markets, provider, BackRunFLContract, tokens, transactionParams } from "./config/consts"
import v2RouterAbi from "./config/v2RouterAbi.json"
import v2FactoryAbi from "./config/v2FactoryAbi.json"
import { Provider, TransactionRequest, TransactionResponse } from "@ethersproject/providers"
import BackRunFLAbi from "../artifacts/contracts/simple-blind-arbitrage/blindBackrunFL.sol/BlindBackrunFL.json"
import { Poolinator } from "./v2pools"
import { Contract } from "ethers"
import Web3EthAbi from "web3-eth-abi"
import { pack } from "@ethersproject/solidity"
const main = async () => {
    const factories = v2Markets.map(market => market.factory.toLowerCase())
    const routers = v2Markets.map(market => market.router.toLowerCase())
    const selectors: any = functionSelectors
    async function loadSigner() {
        const signer =  //loads signer from hardhat, which should be a metamask wallet from truffle-dashboard
            console.log("loaded signer")
        console.log(signer)
        return signer
    }
    const getProvider = () => {
        const provider = new ethers.providers.WebSocketProvider(process.env.WSS_RPC_URL as any, 137)
        return provider
    }
    const provider = new ethers.providers.WebSocketProvider(process.env.WSS_RPC_URL as any)
    const signerProvider = new ethers.providers.JsonRpcProvider(process.env.HTTPS_RPC_URL as string, 137)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, signerProvider)
    const poolinator = new Poolinator(provider, 137)

    const createFactory = (_factoryAddress: string) => {
        return new ethers.Contract(_factoryAddress, v2FactoryAbi, signer)
    }
    const createRouter = (_routerAddress: string) => {
        return new ethers.Contract(_routerAddress, v2RouterAbi, signer)
    }
    function StringToBytes32(text: string) {
        var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
        while (result.length < 66) { result += '0'; }
        if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
        return result;
    }
    const getAmountsIn = async (_firstPair: any, _secondPair: any) => {
        const c = new ethers.Contract(BackRunFLContract, BackRunFLAbi.abi, signer)
        const amountTrade1 = c.getAmountInRead(_firstPair, _secondPair)
        const amountTrade2 = c.getAmountInRead(_secondPair, _firstPair)
        const [t1, t2] = await Promise.all([amountTrade1, amountTrade2])
        return [t1, t2]

    }
    const simulateTrades = async (_provider: any, pairs: string[],) => {
        const c = new ethers.Contract(BackRunFLContract, BackRunFLAbi.abi, signer)
        const nonce = await signer.getTransactionCount("latest")
        const _firstPair = pairs[0]
        const _secondPair = pairs[1]
        if (!_firstPair || !_secondPair) { return }
        console.log("EEE")




        const types = [
            'address',
            'address',
        ]


        const t1Params = [
            _firstPair,
            _secondPair,
        ]


        const t2Params = [
            _secondPair,
            _firstPair,
        ]
        const t1Packed = `${ethers.utils.defaultAbiCoder.encode(types, t1Params)}`
        const t2Packed = `${ethers.utils.defaultAbiCoder.encode(types, t2Params)}`


        const t1params = [

            _firstPair, _secondPair

        ]
        const t2params = [

            _secondPair, _firstPair
        ]
        console.log("FFF")

        try {
            const t1 = await c.callStatic.executeArbitrage(
                ...t1params,
                {
                    nonce: nonce
                }

            )
            console.log(t1)
        } catch (e) {
            console.log(e)
        }

        try {
            const t2 = await c.callStatic.executeArbitrage(
                ...t2params,
                {
                    nonce: nonce + 1
                }
            )
            console.log(t2)
        } catch (e) {
            console.log(e)
        }


        console.log("GGGG")

        // const p = await Promise.all([t1, t2])


    }
    const simulateTransaction = async (t: TransactionResponse, _provider: Provider) => {
        const transaction = {
            to: t.to,
            from: t.from,
            data: t.data,
            maxFeePerGas: t.maxFeePerGas,
            gasLimit: t.gasLimit,
            maxPriorityFeePerGas: t.maxPriorityFeePerGas,
        }
        try {
            const sim = await provider.call(transaction)
            return sim
        } catch (e) {
            console.log(`SIM ERROR: ${e}`)
        }

    }

    const encodeParamsForBackrun = (_firstPair: string, _secondPair: string) => {
        const types = [
            'address',
            'address',
        ]

        const functionParameters = [
            _firstPair,
            _secondPair,
        ]

        const packed = `0x ${pack(types, functionParameters)}`

        const c = new ethers.Contract(BackRunFLContract, BackRunFLAbi.abi, provider)
        console.log(c)
        const eargs = c.interface.encodeFunctionData("makeFlashLoan(address[],address[],bytes)", functionParameters)
        return eargs

    }

    const potentialBackruns = []
    provider.on("pending", (txHash) => {
        if (!txHash) { return }

        provider.getTransaction(txHash).then(async (t) => {
            if (t) {
                if (!t.to) { return }
                if (routers.includes(t.to?.toLowerCase() as string)) {
                    console.log("got a live one")
                    const router = createRouter(t.to as any)
                    const unknownFunctionSelector: string = t.data.slice(0, 10)
                    const _selector = selectors[unknownFunctionSelector]
                    console.log(_selector)

                    if (_selector) {
                        const dargs = router.interface.decodeFunctionData(t.data.slice(0, 10), t.data)
                        const pr = poolinator.checkFactory(poolinator.BaseFactoryAddress as string, dargs.path[0], dargs.path[1])
                        const cpr = poolinator.checkFactory(poolinator.ContraFactoryAddress as string, dargs.path[0], dargs.path[1])
                        const [pair, contraPair] = await Promise.all([pr, cpr])
                        if (pair == false || contraPair == false) { return }
                        const [token0, token1, factoryToCheck] = await poolinator.checkPool(pair) // Get the pool and the other factory we need to check



                        try {
                            //simulate
                            const simBackruns = await simulateTrades(provider, [pair, contraPair])
                            potentialBackruns.push(simBackruns)
                            console.log(simBackruns)
                        } catch (e) {
                            console.log(e)
                        }
                    }
                }
            } else {
                console.log("fuck up1")
                return
            }
        }
        )
    })
}

main().catch((error) => {
    console.error(error);
    // process.exitCode = 1;
});

