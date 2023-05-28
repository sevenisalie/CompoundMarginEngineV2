// { ethers } from "hardhat" types are shitty so we use regular ethers in this here util lib :)
import * as dotenv from "dotenv"
import { ethers } from "ethers";
import { Contract, Provider } from 'ethers-multicall';
import { logDebug, logError, logTrace } from "./logging"

dotenv.config()

export const getMultiCallProvider = (): Provider | ethers.providers.Provider | null => {
    try {
        const providerUrl = process.env.PROVIDER_URL
        const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
        const provider = new Provider(ethersProvider, 137);
        return provider;
    } catch (err) {
        logError("Couldn't fetch Multicall Provider", err)
        return null
    }
}
export const getMultiCallContract = (address: string, abi: Array<string>) => {
    try {
        const ctr = new Contract(address, abi)
        return ctr
    } catch (err) {
        logError("Couldn't fetch Multicall Contract", err)
        return null
    }
}
export const getProvider = (): ethers.providers.Provider | null => {
    try {
        const providerUrl = process.env.PROVIDER_URL as string
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        return provider;
    } catch (err) {
        logError("Couldn't fetch ethers Provider", err)
        return null

    }
};

export const getWSSProvider = (): ethers.providers.Provider => {
    const providerUrl = process.env.PROVIDER_WSS as string
    const provider = new ethers.providers.WebSocketProvider(providerUrl);
    return provider;
};

export const getSigner = (): ethers.Signer | void => {
    const prv = getProvider()
    if (prv !== null) {
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", prv)
        return signer
    } else {
        return logError("Couldn't fetch ethers Signer")
    }

}

export const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    signer: ethers.Signer,
): Promise<void> => {
    // Load the ERC20 contract using the provider and signer
    const contract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer,
    );
    try {
        const tx = await contract.approve(spenderAddress, ethers.constants.MaxUint256);
        return tx
    } catch (err) {
        console.log(err)
        throw new Error(`Could Not Execute Approve Function on ${tokenAddress}`);
    }
};

export const getBatches = (objects: any[], batchSize: number): any[][] => {
    // Calculate the number of batches to process
    const numBatches = Math.ceil(objects.length / batchSize);

    // Create an array to store the batches
    const batches: any[][] = [];

    // Iterate over the objects in batches of the specified size
    for (let i = 0; i < numBatches; i++) {
        // Get the current batch of objects
        const start = i * batchSize;
        const end = start + batchSize;
        const batch = objects.slice(start, end);

        // Add the batch to the array of batches
        batches.push(batch);
    }

    // Return the array of batches
    return batches;
}
