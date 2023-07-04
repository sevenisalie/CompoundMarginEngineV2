import { ethers } from "hardhat"
import { BackRunFLContract } from "./config/consts"
import BackRunFLAbi from "../artifacts/contracts/simple-blind-arbitrage/blindBackrunFL.sol/BlindBackrunFL.json"
import { Poolinator } from "./v2pools"

export const checkPairsForWeth = async (_signer: any, _pairs: string[]) => {
    //check basepool for weth and get tokens
    //then use tokens to find contrapool
    //return both pool addresses <<<<
    const poolinator = new Poolinator(_signer, 137)
    const p = _pairs.map((pair) => poolinator.checkPool(pair))
    const r = await Promise.all(p)
    // console.log("serverside PairData", r)
    const fr = r.filter((data) => data[0] !== false || data[1] !== false || data[2] !== false)
    if (!(fr.length > 0)) { return }
    const token0 = fr[0][0]
    const token1 = fr[0][1]
    const basePairAddress = fr[0][2]
    const t = r.map((data) => {
        if (data[0] == false || data[1] == false) { return }
        const d = poolinator.checkFactory(poolinator.ContraFactoryAddress as string, data[0], data[1])
        return d
    })
    const tr = await Promise.all(t)
    const ftr = tr.filter((item => item !== undefined))
    const ctr = ftr.map((item, i) => {
        if (item == false) {
            return "noAlternativePair"
        } else {
            return {
                basePair: _pairs[i], //look at me im an asshole (this is possible because we used array methods which preserve ordering when iterating over arrays)
                contraPair: item,
                token0: token0,
                token1: token1
            }
        }

    })
    // console.log("serverside Factory Check", tr)
    return ctr
}

export const simulateTrades = async (_signer: any, pairs: string[],) => {
    const c = new ethers.Contract(BackRunFLContract, BackRunFLAbi.abi, _signer)
    const nonce = await _signer.getTransactionCount("latest")
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