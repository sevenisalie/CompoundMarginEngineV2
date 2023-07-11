import { Provider } from "@ethersproject/providers"

import { ethers } from 'hardhat'
import poolABI from './config/v2PoolAbi.json'
import factoryABI from './config/v2FactoryAbi.json'
import { v2Markets, tokens } from "./config/consts"
import { logError, logSuccess } from "./logging"

export class Poolinator {

    provider: Provider
    BaseFactoryAddress: string | undefined
    ContraFactoryAddress: string | undefined
    LiquidityTokenAddress: any //the middle token you'll use to facilitate trades. Usually WETH or whatever the native wrapped currency is on the network. Can also be USDC etc
    constructor(_provider: Provider, _networkID: number,) {
        this.provider = _provider

        // if (_network == 'mainnet') {
        //     this.BaseFactoryAddress = config.mainnetBaseFactoryAddress
        //     this.ContraFactoryAddress = config.mainnetContraFactoryAddress
        //     this.LiquidityTokenAddress = config.mainnetLiquidityTokenAddress
        // } else if (_network == 'goerli') {
        //     this.BaseFactoryAddress = config.goerliBaseFactoryAddress
        //     this.ContraFactoryAddress = config.goerliContraFactoryAddress
        //     this.LiquidityTokenAddress = config.goerliLiquidityTokenAddress

        this.BaseFactoryAddress = (v2Markets.find(market => market.name == "QUICKSWAP"))?.factory
        this.ContraFactoryAddress = (v2Markets.find(market => market.name == "SUSHISWAP"))?.factory
        this.LiquidityTokenAddress = tokens.matic.MATIC


    }

    async checkPool(_address: string) {
        // Create an ethers contract object for the pool
        const poolContract = new ethers.Contract(_address, poolABI, this.provider)
        // console.log("Pool contract created, getting tokens")

        const token0 = await poolContract.token0()
        const token1 = await poolContract.token1()


        const factory = await poolContract.factory()

        if (token0.toLowerCase() == this.LiquidityTokenAddress.toLowerCase() || token1.toLowerCase() == this.LiquidityTokenAddress.toLowerCase()) {
            // logSuccess("Pool is a Liquidty Token pair")
            if (factory == this.BaseFactoryAddress) {
                // console.log("Pool is on BaseSwap v2")
                return [token0, token1, this.BaseFactoryAddress]
            } else {
                // console.log("Pool is on ContraSwap v2")
                return [token0, token1, this.ContraFactoryAddress]
            }
        } else {
            // logError("Pool is not Liquidity Token pair, Liquidity Token address is:", this.LiquidityTokenAddress, `Pool Token Address ${_address}`)
            return [false, false, false]
        }
    }

    async checkFactory(_factoryAddress: string, _token0: string, _token1: string): Promise<boolean | string> {
        // Create an ethers contract object for the factory
        const factoryContract = new ethers.Contract(_factoryAddress, factoryABI, this.provider)
        // console.log("Checking alternative factor for pair")

        const pair = await factoryContract.getPair(_token0, _token1)

        if (pair == "0x0000000000000000000000000000000000000000") {
            // console.log("Pair does not exist on alternative factory, returning")
            return false
        } else {
            console.log("Alternate pair exists! Pair address:", pair)
            return pair
        }
    }
}

