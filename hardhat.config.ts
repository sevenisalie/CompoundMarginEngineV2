import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    "truffle-dashboard": {
      url: "http://localhost:24012/rpc",
    },
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
