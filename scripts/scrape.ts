//project outline
//scrape all borrowers
//sort them into markets
//calculate their liquidity ratio
//save spicy ones to special spicy users data structure //
import { BytesLike, Contract, Signer, getDefaultProvider } from "ethers"
import { ethers } from "hardhat"
import { CONTRACTS, MARKET_TOKENS } from "./consts"
import { OMatic } from "../typechain-types/contracts/Ovix-contracts-master/otokens/OMatic"
import { OErc20 } from "../typechain-types/contracts/Ovix-contracts-master/otokens/OErc20"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Comptroller } from "../typechain-types/contracts/Ovix-contracts-master/Comptroller.sol"
import { TypedEvent } from "../typechain-types/common"
import { MultiCall } from "../typechain-types"
import { MulticallProvider, MulticallWrapper } from "ethers-multicall-provider/lib"
import { Fragment } from "@ethersproject/abi"
import { BaseProvider } from "@ethersproject/providers"
import Databasinator, { User } from "./database"

type callData = {
    params: any[];
    userAddress: any;
}
export type MarketToken = {
    contract: OMatic;
    address: string;
    name: string;
} | {
    contract: OErc20;
    address: string;
    name: string;
}

export type Borrowers = {
    marketToken: MarketToken;
    borrowers: {
        block: any;
        address: any;
        borrowAmount: any;
        accountTotalBorrows: any;
        marketTotalDebt: any;
    }[];
}[]

export default class Scrapinator {
    public initialization: boolean = false
    public borrowers: Borrowers = []
    public borrowerAddresses: string[] | null = null
    public borrowerLiquidity: any[] = []
    public marketTokens: (MarketToken)[] = []
    private signer!: SignerWithAddress;
    public comptroller!: Comptroller;
    public multicall: Multicall | undefined;
    public owner: string = ""
    public start = 1
    public end = 69
    private failedLiquidityCallAddresses: string[] = []
    public database = new Databasinator()

    constructor() {

    }

    public async loadAccountsLiquidity() {
        if (this.borrowerAddresses !== null) {
            console.log("Beginning Loading")
            const data = this.borrowerAddresses
            const temp = []
            const chunks: any = this.multicall?.chunkCalls(data, 10)
            const failedtemp = []
            for (let i = 0; i < chunks?.length; i++) {
                try {
                    console.log(`calling chunk ${i}`)


                    const callChunk = await this.multicall?.batchCalls(chunks[i], "getAccountLiquidity")

                    const cleaned = callChunk?.map((chunk) => {
                        return {
                            userAddress: chunk.user,
                            marginCondition: {
                                error: chunk.data[0],
                                liquidity: chunk.data[1],
                                shortfall: chunk.data[2]
                            },
                        }
                    })

                    const docs = cleaned?.map((user) => {
                        return new this.database.User(user)
                    }) as User[] //this is a pig wrapped in shit, youre welcome
                    console.log("saved to db")

                    await this.database.insertUsersInBatches(docs, 10)

                    temp.push(cleaned)
                    console.log(`success pushed chunk ${i}`)
                } catch (error) {
                    failedtemp.push(...chunks[i])
                    console.log(`failed pushing chunk ${i} sent to failedarray`)
                    console.log(`total failes ${Math.floor(this.failedLiquidityCallAddresses.length / 20)}`)
                    console.log(error)
                    await new Promise(r => setTimeout(r, 3000));
                }
                const flattened = temp.flat(1)
                this.failedLiquidityCallAddresses = failedtemp
                this.borrowerLiquidity = flattened
            }
        } else {
            throw new Error("Borrower Accounts Were not Properly Loaded")
        }

    }

    public async updateBlockHeight(blockHeight?: number) {
        if (typeof blockHeight !== "undefined") {
            this.end = blockHeight
        }
        const _end = await this.signer.provider?.getBlockNumber() || 88 //a nice low number thats not 69
        this.end = _end
    }

    public async init() {
        console.log("A")
        await this.loadSigner()
        console.log("B")
        await this.loadComptroller()
        console.log("C")
        await this.loadTokens()
        console.log("D")

        await this.updateBlockHeight()
        console.log("E")

        await this.loadBorrowers()
        console.log("F")

        await this.loadBorrowerAddresses()
        console.log("G")

        await this.database.initDB()
        console.log("H")
        this.multicall = new Multicall(this.signer, this.comptroller)
        this.owner = this.signer?.address
        this.initialization = true

        return this.initialization
    }

    public async loadTokens() {
        if (this.signer !== undefined && this.comptroller !== undefined) {
            const proms = MARKET_TOKENS.map(async (token) => {
                if (token.name == "oETH") { //this is because Ovix launched on polygon where MATIC is the native gas token which requires special contract.  They ported contracts to zkEVM which uses ETH as native, which means that the 
                    const ctr = await ethers.getContractAt("OMatic", token.address, this.signer)
                    return {
                        ...token,
                        contract: ctr
                    }
                } else {
                    const ctr = await ethers.getContractAt("OErc20", token.address, this.signer)
                    return {
                        ...token,
                        contract: ctr
                    }
                }
            })
            const dart = await Promise.all(proms)
            this.marketTokens = dart
            return await Promise.all(proms)
        }
    }
    private async loadSigner() {
        this.signer = (await ethers.getSigners())[0] //loads signer from hardhat, which should be a metamask wallet from truffle-dashboard
        return true
    }
    private async loadComptroller() {
        const ctr = await ethers.getContractAt("Comptroller", CONTRACTS.Unitroller, this.signer) //
        this.comptroller = ctr
        return true
    }
    public async fetchAccountDetails(address: string) {
        try {
            const data = await this.comptroller.getAccountLiquidity(address)
            return data
        } catch (error) {
            return new Error(`Scrapinator Error fn(fetchAccountDetails): ${error}`)
        }
    }


    private async _fetchBorrowers() {

        const filters = this.marketTokens.map(token => {
            const filter = token.contract.filters.Borrow()
            const request = token.contract.queryFilter(
                filter,
                this.start,
                this.end
            )
            return request
        })
        const resolve = await Promise.all(filters)
        const resolveMappedToTokens = resolve.map((resolve, i) => {
            return {
                marketToken: this.marketTokens[i],
                borrowers: this._cleanBorrower(resolve)
            }
        })
        return resolveMappedToTokens
    }

    private _cleanBorrower(_rawResolve: any) {
        const cleanedResolve = _rawResolve.map(((borrower: any) => {
            const _borrower = {
                block: borrower.blockNumber,
                address: borrower.args[0],
                borrowAmount: borrower.args[1],
                accountTotalBorrows: borrower.args[2],
                marketTotalDebt: borrower.args[3]
            }
            return _borrower
        }))
        return cleanedResolve
    }

    public async loadBorrowers() {
        const rawBorrowers = await this._fetchBorrowers()
        this.borrowers = rawBorrowers
        return rawBorrowers
    }

    public async aggregateAddresses() {
        if (this.borrowers.length == 0) {
            await this.loadBorrowers()
        }
        const mergedMarketAddresses = []
        const allMarketAddresses = this.borrowers.map((market: any, i: any) => {
            const marketAddresses = market.borrowers.map((borrower: any, j: number) => {
                return borrower.address
            })
            return marketAddresses
        })
        for (let i = 0; i < allMarketAddresses.length; i++) {
            mergedMarketAddresses.push(...allMarketAddresses[i])
        }
        function removeDuplicates(dataset: any) {
            return [...new Set(dataset)];
        }
        const pureAddresses = removeDuplicates(mergedMarketAddresses) as string[]
        this.borrowerAddresses = pureAddresses
        return pureAddresses
    }

    public async loadBorrowerAddresses() {
        const p = await this.aggregateAddresses()
        this.borrowerAddresses = p
        return true
    }

    public async fetchUserLiquidity(address: string) {
        const call = await this.comptroller.getAccountLiquidity(address)
        return {
            error: call[0],
            liquidity: call[1],
            shortfall: call[2]
        }
    }

    public async fetchAllUserLiquidity() {
        if (this.borrowerAddresses?.length == null) {
            await this.aggregateAddresses()
        }
        const mappedCalls = this.borrowerAddresses?.map((address) => {
            return this.comptroller.getAccountLiquidity(address)
        }) as any
        const resolvedCalls = await Promise.all(mappedCalls)
        return resolvedCalls
    }
}

export class Multicall {
    public signer: SignerWithAddress
    public target: Contract;
    public provider: MulticallProvider<BaseProvider>;
    constructor(_signer: SignerWithAddress, _target: Contract) {
        this.signer = _signer
        const provider = _signer.provider as BaseProvider
        this.provider = MulticallWrapper.wrap(provider)
        this.target = new ethers.Contract(_target.address, _target.interface, this.provider)
    }

    public chunkCalls(calldata: any[], chunkSize: number) {
        const numChunks = Math.ceil(calldata.length / chunkSize);
        return Array.from({ length: numChunks }, (_, index) => {
            const start = index * chunkSize;
            const end = start + chunkSize;
            return calldata.slice(start, end);
        });
    }

    public async batchCalls(_data: any[], _functionName: string) {
        if (_data.length > 20) {
            throw new Error(`Multicall can only handle 20 congruous calls, please limit the lenght of calls to 20`)
        }

        const promies = _data.map((calldata) => {
            return this.target["getAccountLiquidity"](calldata)
        })
        const calls = await Promise.all(promies)
        const callss = calls.map((call, i) => {
            return {
                data: call,
                user: _data[i]
            }
        })

        return callss

    }
}