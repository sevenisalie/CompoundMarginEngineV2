import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat"
import FactoryABI from "./config/v3FactoryAbi.json"
import { BaseTokens, ERC20, ExternalContracts, IERC20Metadata, SpecialMintERC20, V3Pool, WETH } from "./config/consts";
import fs from 'fs';
import { BigNumber, Contract } from "ethers";
import JSBI from "jsbi"
import { FullMath, Route, TickMath } from "@uniswap/v3-sdk"
import bn from "bignumber.js"
import { Currency, Ether } from '@uniswap/sdk-core';
import { pullTokenInfoSync } from "./utils";
import { pack } from "@ethersproject/solidity"
import path from 'path';

export class Trade {
    private signer: SignerWithAddress;
    public quoter: Contract;
    public player: Address;
    public WETH: Address = WETH.zkevm
    public path: PairObject[] = []
    public tokenIn: Token;
    public tokenOut: Token;
    public adjacentPairs: PairObject[] = []
    public paths: PairObject[][] = []
    public maxHops: number;
    // public wrappedNative: Currency;

    constructor(_tokenIn: Address | "ETH", _tokenOut: Address | "ETH", _maxHops = 4, _signer: SignerWithAddress) {
        //init
        this.signer = _signer
        this.player = _signer.address
        const { address, abi } = ExternalContracts.zkevm.quickSwapQuoterV3
        this.quoter = new ethers.Contract(address, abi, _signer)
        this.maxHops = _maxHops

        //token init
        const tokenInInfo = pullTokenInfoSync(_tokenIn)
        const tokenOutInfo = pullTokenInfoSync(_tokenOut)

        this.tokenIn = tokenInInfo
        this.tokenOut = tokenOutInfo

        //route init
        this.findAdjacentPairs()
        this.computeAllRoutes()
        this.path = this.paths[0] //main path, alway wselcome to pull this.paths instead since its public
    }
    private readJsonFromFile(path: any) {
        try {
            const jsonData = fs.readFileSync(path, 'utf8');
            const data = JSON.parse(jsonData);
            return data;
        } catch (err) {
            console.error('Error reading JSON file:', err);
            return null;
        }
    }
    private fetchAllPairs() {
        const d = this.readJsonFromFile("scripts/config/pairs.json")
        return d
    }
    private findAdjacentPairs() {
        const allPairs = this.fetchAllPairs()
        const baseTokens = BaseTokens.map((token) => {
            return token.address.toLowerCase()
        })
        const routes = []
        for (const pair of allPairs) {
            const { token0, token1 } = pair

            if (token0.address.toLowerCase() === this.tokenIn.address.toLowerCase() || token1.address.toLowerCase() === this.tokenIn.address.toLowerCase()) {
                if (baseTokens.includes(pair.token0.address.toLowerCase()) || baseTokens.includes(pair.token1.address.toLowerCase())) {
                    routes.push(pair);
                }

            }
            if (token0.address.toLowerCase() === this.tokenOut.address.toLowerCase() || token1.address.toLowerCase() === this.tokenOut.address.toLowerCase()) {
                if (baseTokens.includes(pair.token0.address.toLowerCase()) || baseTokens.includes(pair.token1.address.toLowerCase())) {
                    routes.push(pair);
                }
            }
        }
        // console.log(routes)
        const uniquePairs = routes.filter((v, i, a) => a.findIndex(v2 => (v2.pair === v.pair)) === i)


        this.adjacentPairs = uniquePairs
        return uniquePairs
    }

    private poolEquals(poolA: PairObject, poolB: PairObject): boolean {
        return (
            poolA === poolB ||
            (poolA.token0.address) == (poolB.token0.address) &&
            poolA.token1.address == (poolB.token1.address)
        )
    }
    private tokenEquals(tokenA: Token, tokenB: Token) {
        return tokenA.address.toLowerCase() === tokenB.address.toLowerCase()
    }

    public involvesToken(token: Token, pair: PairObject): boolean {
        return this.tokenEquals(token, pair.token0) || this.tokenEquals(token, pair.token1)
    }
    private computeAllRoutes(
        currencyIn: Token = this.tokenIn,
        currencyOut: Token = this.tokenOut,
        pools: PairObject[] = this.adjacentPairs,
        currentPath: PairObject[] = [],
        allPaths: Array<Array<PairObject>> = [],
        startCurrencyIn: Token = currencyIn,
        maxHops = this.maxHops
    ): PairObject[][] {
        const tokenIn = currencyIn
        const tokenOut = currencyOut
        if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')

        for (const pool of pools) {

            if (!this.involvesToken(tokenIn, pool) || currentPath.find((pathPool) => this.poolEquals(pool, pathPool))) continue

            const outputToken = this.tokenEquals(pool.token0, tokenIn) ? pool.token1 : pool.token0
            if (this.tokenEquals(outputToken, tokenOut)) {
                allPaths.push([...currentPath, pool])
            } else if (maxHops > 1) {
                this.computeAllRoutes(
                    outputToken,
                    currencyOut,
                    pools,
                    [...currentPath, pool],
                    allPaths,
                    startCurrencyIn,
                    maxHops - 1
                )
            }
        }
        this.paths = allPaths
        return allPaths
    }

    public async getAmountIn(): Promise<BigNumber> {
        let _route: Address[] = [this.tokenIn.address, this.WETH, this.tokenOut.address]
        if (this.tokenIn.address == this.WETH) {
            _route = [this.WETH, this.tokenOut.address]
        }
        if (this.tokenOut.address == this.WETH) {
            _route = [this.tokenIn.address, this.WETH]
        }
        const call: BigNumber = await this.quoter.callStatic.quoteExactInput(
            pack(new Array(_route.length).fill("address"), _route),
            ethers.utils.parseUnits("1")
        )
        console.log(`
        You get ${ethers.utils.formatUnits(call, this.tokenOut.decimals)} ${this.tokenOut.symbol}s for every 1 ${this.tokenIn.symbol}s
        `)
        console.log(call)

        return call
    }

}

type Address = string
type Token = {
    address: Address,
    symbol: string,
    name: string,
    decimals: number
}
type PairObject = {
    pair: Address,
    token0: {
        address: Address,
        symbol: string,
        name: string,
        decimals: number
    },
    token1: {
        address: Address,
        symbol: string,
        name: string,
        decimals: number
    }
}

type LiquidityObject = {
    token0: {
        address: Address,
        symbol: string,
        name: string,
        decimals: number
        liquidity: BigNumber
    },
    token1: {
        address: Address,
        symbol: string,
        name: string,
        decimals: number,
        liquidity: BigNumber
    }
}

export class Liquiditinator {
    //takes in a pair object as constructor
    //operations to determine liquidity quality of pair
    public PAIR: PairObject;
    public Pair: Contract;
    private Signer: SignerWithAddress;
    public Slot0: any
    public Liquidity: LiquidityObject;
    constructor(_pair: PairObject, _signer: SignerWithAddress) {
        this.PAIR = _pair
        this.Signer = _signer
        this.Pair = new ethers.Contract(_pair.pair, V3Pool, _signer)
        //init liquidity
        this.Liquidity = {
            token0: {
                ..._pair.token0,
                liquidity: ethers.utils.parseUnits("0", 18)
            },
            token1: {
                ..._pair.token1,
                liquidity: ethers.utils.parseUnits("0", 18)
            }
        }
    }

    public async init() {
        const d = await this.Pair.globalState()
    }

    public async refreshSlot0Data() {
        console.log("Pair")
        console.log(this.Pair.address)
        console.log(`Token0: ${this.Liquidity.token0.name}`)
        console.log(`Token1: ${this.Liquidity.token1.name}`)
        const d = await this.Pair.globalState()
        this.Slot0 = {
            price: new bn(d.price),
            tick: Math.abs(d.tick),
            fee: d.fee,
            timepointIndex: d.timepointIndex,
            communityFeeToken0: d.communityFeeToken0,
            communityFeeToken1: d.communityFeeToken1,
            unlocked: d.unlocked
        }
        console.log(this.Slot0)

        return
    }

    private async calculatePriceAtSqrtPriceX96(
        amountIn: BigNumber,
        currentSqrtPriceX96: bn,
        token0Decimals: number,
        token1Decimals: number
    ) {
        const SqrtPriceX96 = this.Slot0.price
        const q = new bn(2).pow(96)
        const decimalQuotient0 = new bn(10).pow(token0Decimals)
        const decimalQuotient1 = new bn(10).pow(token1Decimals)

        const p = currentSqrtPriceX96.div(q).pow(2)

        const p0 = p.div(decimalQuotient1)
        const p1 = p.div(decimalQuotient0)

        return {
            forwardPrice: p0,
            backwardPrice: p1
        }
    }

    private async calculatePriceAtTick(
        amountIn: number,
        currentTick: number,
        baseTokenDecimals: number,
        quoteTokenDecimals: number

    ) {
        //P = price
        //Q96 = 2⁹⁶
        //SqrtPriceX96 = √P * Q96
        // Price of token0 : 1
        // P =  (SqrtPriceX96 / Q96)² 
        //price of token1: 0
        //d = decimals1 - decimals0
        // (1 / P) * 10ᵈ
        const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(currentTick)
        const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
        const baseAmountIn = JSBI.BigInt(amountIn * (10 ** baseTokenDecimals))
        const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))
        const quote = FullMath.mulDivRoundingUp(ratioX192, baseAmountIn, shift)
        return {
            forwardPrice: ethers.utils.parseUnits(quote.toString(), quoteTokenDecimals),
            backwardPrice: JSBI.divide(
                JSBI.BigInt(1),
                quote
            )
        }
    }

    public async getPrice(_tokenIn: 0 | 1) {
        await this.refreshSlot0Data() //refresh price state to most recent
        const prices = await this.calculatePrice(1, this.Slot0.tick, this.Liquidity.token0.decimals, this.Liquidity.token1.decimals)

        if (_tokenIn == 0) {
            // P =  (SqrtPriceX96 / Q96)² 
            return prices.forwardPrice
        }
        if (_tokenIn == 1) {
            return prices.backwardPrice
        }
        if (_tokenIn != 0 || 1) {
            throw new Error("token slot must be an Integer 0 or 1 from which to reference price. 0 or 1 refers to token0 or token1 respectively")
        }
        return
    }
}

export class Snipinator {
    //takes in targets aka UniV2 Factory
    //finds LPs from events
    //organizes LPs by 6-base liquidity tokens (USDC USDT DAI ETH _NATIVE BTC)
    private SIGNER;
    private FACTORY;
    constructor(_signer: SignerWithAddress, _factory: string) {
        this.SIGNER = _signer
        this.FACTORY = new ethers.Contract(_factory, FactoryABI, _signer)

    }

    public async fetchPairsEvents() {
        const blockheight = await this.SIGNER.provider?.getBlockNumber()
        const filter = this.FACTORY.filters.Pool()
        const request = await this.FACTORY.queryFilter(
            filter
        )

        return request
    }
    private writeObjectToJsonFile(object: any, filePath: string) {
        const jsonData = JSON.stringify(object);

        const directoryPath = path.dirname(filePath);

        // Create the directory structure if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        fs.writeFileSync(filePath, jsonData);
    }

    // Function to read JSON from a file and return the parsed data
    private readJsonFromFile(path: any) {
        try {
            const jsonData = fs.readFileSync(path, 'utf8');
            const data = JSON.parse(jsonData);
            return data;
        } catch (err) {
            console.error('Error reading JSON file:', err);
            return null;
        }
    }
    public async getTokenInfo(_address: string) {
        const c = new ethers.Contract(_address, IERC20Metadata, this.SIGNER)
        const n = await c.name()
        const s = await c.symbol()
        const de = await c.decimals()
        return {
            name: n,
            symbol: s,
            decimals: de
        }
    }
    private async cleanEventPair(pairEvents: any) {
        const eventArgs = pairEvents.map((event: any) => {
            return event.args
        })
        const cleanedArgs = eventArgs.map(async (args: any) => {
            return {
                pair: args[2],
                token0: {
                    address: args[0],
                    symbol: (await this.getTokenInfo(args[0])).symbol,
                    name: (await this.getTokenInfo(args[0])).name,
                    decimals: (await this.getTokenInfo(args[0])).decimals
                },
                token1: {
                    address: args[1],
                    symbol: (await this.getTokenInfo(args[1])).symbol,
                    name: (await this.getTokenInfo(args[1])).name,
                    decimals: (await this.getTokenInfo(args[1])).decimals
                },
            }
        })
        const d = await Promise.all(cleanedArgs)
        return d
    }
    public async createAllPairs() {
        const allEvents = await this.fetchPairsEvents()
        const eventArgs = allEvents.map(event => {
            return event.args
        })
        const cleanedArgs = eventArgs.map(async (args: any) => {
            return {
                pair: args[2],
                token0: {
                    address: args[0],
                    symbol: (await this.getTokenInfo(args[0])).symbol,
                    name: (await this.getTokenInfo(args[0])).name,
                    decimals: (await this.getTokenInfo(args[0])).decimals
                },
                token1: {
                    address: args[1],
                    symbol: (await this.getTokenInfo(args[1])).symbol,
                    name: (await this.getTokenInfo(args[1])).name,
                    decimals: (await this.getTokenInfo(args[1])).decimals
                },
            }
        })

        const d = await Promise.all(cleanedArgs)
        this.writeObjectToJsonFile(d, "scripts/config/pairs.json")
        return
    }

    public fetchAllPairs() {
        const d = this.readJsonFromFile("scripts/config/pairs.json")
        return d
    }

    public async detectNewPairs() {
        const pairs = this.fetchAllPairs()
        console.log(pairs.length)
        const pairEvents = await this.fetchPairsEvents()
        const newPairCount = pairEvents.length - pairs.length
        if (newPairCount == 0) {
            return false
        } else {
            const cleanedEvents = await this.cleanEventPair(pairEvents.slice(pairs.length, pairEvents.length))
            const newArray = [...pairs, ...cleanedEvents]
            this.writeObjectToJsonFile(newArray, "scripts/config/pairs.json")
            console.log((this.fetchAllPairs()).length)
            console.log(pairEvents.length)
            return true
        }
    }
}