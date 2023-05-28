import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat"
import FactoryABI from "./config/v3FactoryAbi.json"
import { ERC20, IERC20Metadata, SpecialMintERC20 } from "./config/consts";
import fs from 'fs';
import { BigNumber, Contract } from "ethers";
const path = require('path');
type Address = string
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

    public Liquidity: LiquidityObject;
    constructor(_pair: PairObject, _signer: SignerWithAddress) {
        this.PAIR = _pair
        this.Signer = _signer
        this.Pair = new ethers.Contract(_pair.pair, ERC20, _signer)
        //init liquidity
        this.Liquidity = {
            token0: {
                ..._pair.token0,
                liquidity: ethers.utils.parseUnits("0", 18)
            },
            token1: {
                ..._pair.token0,
                liquidity: ethers.utils.parseUnits("0", 18)
            }
        }
    }

    public async init() {

    }

    public async refreshSlot0Data() {
        const d = this.Pair.slot0()
    }
    public async getPrice(_tokenSlot: 0 | 1) {
        //P = price
        //Q96 = 2⁹⁶
        //SqrtPriceX96 = √P * Q96
        // Price of token0 : 1
        // P =  (SqrtPriceX96 / Q96)² 
        //price of token1: 0
        //d = decimals1 - decimals0
        // (1 / P) * 10ᵈ
        if (_tokenSlot == 0) {
            // P =  (SqrtPriceX96 / Q96)² 
            return
        }
        if (_tokenSlot == 1) {
            return
        }
        if (_tokenSlot != 0 || 1) {
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