import { ethers } from "hardhat"
import { functionSelectors, v2Markets, provider, BackRunFLContract, tokens, transactionParams } from "./config/consts"
import v2RouterAbi from "./config/v2RouterAbi.json"
import v2FactoryAbi from "./config/v2FactoryAbi.json"
import { Provider, TransactionRequest, TransactionResponse } from "@ethersproject/providers"
import BackRunFLAbi from "../artifacts/contracts/simple-blind-arbitrage/blindBackrunFL.sol/BlindBackrunFL.json"
import { Poolinator } from "./v2pools"
import { BytesLike, Contract, EventFilter, Wallet } from "ethers"
import Web3EthAbi from "web3-eth-abi"
import { pack } from "@ethersproject/solidity"

export class Listenator {
    //creates webscoket listener - takes in event topic and executor callback function
    private signer: Wallet;
    public provider: any; //this should be websocket provider, but hardhat/ethers has typing issues
    public contract: Contract
    public eventTopic: EventFilter; //event to listen to. custom executors will likely take in whatever data this is to do *something*
    private executor: (txHash: string, signer: any) => void; //executor function should return true on succ and false on fail
    constructor(_contract: Contract, _eventTopic: string, _executorFunction: (txHash: string, signer: any) => void) {
        this.provider = new ethers.providers.WebSocketProvider(process.env.WSS_RPC_URL as any)
        const signerProvider = new ethers.providers.JsonRpcProvider(process.env.HTTPS_RPC_URL as string, 137)
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, signerProvider)
        this.executor = _executorFunction

        this.eventTopic = {
            address: _contract.address,
            topics: [ethers.utils.id(_eventTopic)]
        }

        this.contract = _contract.connect(this.signer)
        // if ((_contract.filters.topics().map((e) => e))) {}
        _contract.filters[_eventTopic]
    }

    public computeKeccak256EventTopic(_eventTopic: string) {
        const b = ethers.utils.formatBytes32String(_eventTopic)
        const e = ethers.utils.keccak256(b)
        return e
    }

    public onPending() {
        console.log("starts")
        this.provider.on("pending", (txHash: string) => {
            if (!txHash) { return }
            this.executor(txHash, this.signer)

        })

    }
    public onBlock() {
        this.provider.on("block", (blockNumber: any) => {
            if (!this.eventTopic) { return blockNumber }
            this.contract.queryFilter(
                this.eventTopic,
                blockNumber - 1,
                blockNumber
            )
        })
    }
}