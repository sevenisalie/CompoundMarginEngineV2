import TOKENLIST from "./TOKENLIST.json"
import V3FACTORYABI from "./v3FactoryAbi.json"
import V3ROUTERABI from "./v3SwapRouterAbi.json"
import * as ethers from "ethers"

export const transactionParams = {
  normal: {
    maxPriorityFeePerGas: ethers.utils.parseUnits("50", 9),
    maxFeePerGas: ethers.utils.parseUnits("51", 9)
  },
  aggressive: {
    maxPriorityFeePerGas: ethers.utils.parseUnits("200", 9),
    maxFeePerGas: ethers.utils.parseUnits("201", 9)
  }
}
//ABI SNIPPETS
export const IERC20Metadata = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)"
]
export const ERC20 = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
]
export const UniswapV2Router02ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
  "function getToken(bytes32 query) view returns (address token)"
];

export const UniswapV2PairABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)"
]

export const UniswapV2Factory = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function allPairs(uint) external view returns (address pair)",
  "function allPairsLength() external view returns (uint)"
]
export const SpecialMintERC20 = [
  "function mintTo(address to,uint256 amount) public"
]
export const PingerAddress = "0xd63956503e7869a25FeD40AF20073359475a71b1"


//important addresses
export const ExternalContracts = {
  zkevm: {
    quickswapFactoryV3: {
      address: "0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57",
      abi: V3FACTORYABI
    },
    quickswapRouterV3: {
      address: "0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd",
      abi: V3ROUTERABI
    }
  }
}

export const BaseTokens = [
  {
    "name": "Wrapped BTC",
    "address": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    "symbol": "WBTC",
    "decimals": 8,
  },
  {
    "name": "Wrapped Matic",
    "address": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "symbol": "WMATIC",
    "decimals": 18,
  },
  {
    "name": "Ether",
    "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    "symbol": "ETH",
    "decimals": 18,
  },
  {
    "name": "USD Coin",
    "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "symbol": "USDC",
    "decimals": 6,
  },
  {
    "name": "Tether USD",
    "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    "symbol": "USDT",
    "decimals": 6,
  },
  {
    "name": "Dai Stablecoin",
    "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "symbol": "DAI",
    "decimals": 18,
  },
]

export const markets = [
  {
    address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    name: "quickswap",
    initCode: "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"
  }
]