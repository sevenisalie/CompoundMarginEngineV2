import { Provider } from "@ethersproject/providers"

import { ethers } from 'hardhat'
import poolABI from './config/v2PoolAbi.json'
import factoryABI from './config/v2FactoryAbi.json'
import { v2Markets, tokens } from "./config/consts"

export class Poolinator {

    provider: Provider
    UniswapFactoryAddress: string | undefined
    SushiFactoryAddress: string | undefined
    WETHAddress: any
    constructor(_provider: Provider, _network: string) {
        this.provider = _provider

        // if (_network == 'mainnet') {
        //     this.UniswapFactoryAddress = config.mainnetUniswapFactoryAddress
        //     this.SushiFactoryAddress = config.mainnetSushiFactoryAddress
        //     this.WETHAddress = config.mainnetWETHAddress
        // } else if (_network == 'goerli') {
        //     this.UniswapFactoryAddress = config.goerliUniswapFactoryAddress
        //     this.SushiFactoryAddress = config.goerliSushiFactoryAddress
        //     this.WETHAddress = config.goerliWETHAddress

        this.UniswapFactoryAddress = (v2Markets.find(market => market.name == "QUICKSWAP"))?.factory
        this.SushiFactoryAddress = (v2Markets.find(market => market.name == "SUSHISWAP"))?.factory
        this.WETHAddress = tokens.matic.ETH


        console.log("PoolManager initialized for network:", _network)
    }

    async checkPool(_address: string) {
        // Create an ethers contract object for the pool
        const poolContract = new ethers.Contract(_address, poolABI, this.provider)
        console.log("Pool contract created, getting tokens")

        const token0 = await poolContract.token0()
        const token1 = await poolContract.token1()
        console.log("Token0:", token0)
        console.log("Token1:", token1)

        const factory = await poolContract.factory()
        console.log("Factory:", factory)

        if (token0 == this.WETHAddress || token1 == this.WETHAddress) {
            console.log("Pool is WETH pair")
            if (factory == this.UniswapFactoryAddress) {
                console.log("Pool is Uniswap v2")
                return [token0, token1, this.SushiFactoryAddress]
            } else {
                console.log("Pool is Sushiswap")
                return [token0, token1, this.UniswapFactoryAddress]
            }
        } else {
            console.log("Pool is not WETH pair, WETH address is:", this.WETHAddress)
            return [false, false, false]
        }
    }

    async checkFactory(_factoryAddress: string, _token0: string, _token1: string) {
        // Create an ethers contract object for the factory
        const factoryContract = new ethers.Contract(_factoryAddress, factoryABI, this.provider)
        console.log("Checking alternative factor for pair")

        const pair = await factoryContract.getPair(_token0, _token1)

        if (pair == "0x0000000000000000000000000000000000000000") {
            console.log("Pair does not exist on alternative factory, returning")
            return false
        } else {
            console.log("Alternate pair exists! Pair address:", pair)
            return pair
        }
    }
}

