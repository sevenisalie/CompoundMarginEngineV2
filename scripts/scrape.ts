//project outline
//scrape all borrowers
//sort them into markets
//calculate their liquidity ratio
//save spicy ones to special spicy users data structure //
import { Contract, Signer } from "ethers"
import { ethers } from "hardhat"
import { CONTRACTS, MARKET_TOKENS } from "./consts"
import { OMatic } from "../typechain-types/contracts/Ovix-contracts-master/otokens/OMatic"
import { OErc20 } from "../typechain-types/contracts/Ovix-contracts-master/otokens/OErc20"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Comptroller } from "../typechain-types/contracts/Ovix-contracts-master/Comptroller.sol"
import { TypedEvent } from "../typechain-types/common"
type MarketToken = {
    contract: OMatic;
    address: string;
    name: string;
} | {
    contract: OErc20;
    address: string;
    name: string;
}

type Borrowers = {
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
    public marketTokens: (MarketToken)[] = []
    private signer!: SignerWithAddress;
    public comptroller!: Comptroller;
    public owner: string = ""
    public start = 1
    public end = 69
    constructor() {

    }

    public async updateBlockHeight(blockHeight?: number) {
        if (typeof blockHeight !== "undefined") {
            this.end = blockHeight
        }
        const _end = await this.signer.provider?.getBlockNumber() || 88 //a nice low number thats not 69
        this.end = _end
    }
    public async init() {
        await this.loadSigner()
        await this.loadComptroller()
        await this.loadTokens()
        await this.updateBlockHeight()
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
        if (!this.initialization) {
            await this.init()
        }
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

    public async aggregateAddresses(_data: any) {
        const mergedMarketAddresses = []
        const allMarketAddresses = _data.map((market: any, i: any) => {
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
        const pureAddresses = removeDuplicates(mergedMarketAddresses)

        return pureAddresses
    }

}