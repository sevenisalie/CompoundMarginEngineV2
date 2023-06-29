import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'
import "hardhat-gas-reporter"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    "truffle-dashboard": {
      url: "http://localhost:24012/rpc",
    },
    "matic": {
      url: "https://lively-methodical-bush.matic.discover.quiknode.pro/5d8e288f56131ce3af98ce9e4e3dac4b81263d28/",
    },
    "eth": {
      url: "https://maximum-polished-card.discover.quiknode.pro/3278539368889c7eed4ce06a7f318f9da4b1d53a/",
    },
  },
  gasReporter: {
    enabled: false
  },
  etherscan: {
    apiKey: {
      zkevm: process.env.ZKSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "zkevm",
        chainId: 1101,
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com/"
        }
      }
    ]
  },

};

export default config;
