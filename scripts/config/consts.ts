import TOKENLIST from "./TOKENLIST.json"
import V3FACTORYABI from "./v3FactoryAbi.json"
import V3ROUTERABI from "./v3SwapRouterAbi.json"
import V3POOLABI from "./v3Pool.json"
import V3QUOTERABI from "./quickSwapQuoter.json"
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
export const QuoterAbi = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public returns (uint256 amountOut)",
  "function quoteExactInput( bytes path, uint256 amountIn ) external returns (uint256 amountOut)",
  "function quoteExactOutputSingle( address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96 ) public returns (uint256 amountIn)",
  "function quoteExactOutput( bytes path, uint256 amountOut ) external returns (uint256 amountIn)"
]

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
export const V3Pool = V3POOLABI
export const V3Factory = V3FACTORYABI
export const V3Router = V3ROUTERABI

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
    },
    quickSwapQuoterV3: {
      address: "0x55BeE1bD3Eb9986f6d2d963278de09eE92a3eF1D",
      abi: V3QUOTERABI
    }
  }
}

export const WETH = {
  zkevm: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9"
}

export const BaseTokens = [
  {
    "address": "0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1",
    "symbol": "WBTC",
    "name": "Wrapped BTC",
    "decimals": 8
  },
  {
    "address": "0xa2036f0538221a77A3937F1379699f44945018d0",
    "symbol": "MATIC",
    "name": "Matic Token",
    "decimals": 18
  },
  {
    "address": "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
    "symbol": "WETH",
    "name": "Wrapped Ether",
    "decimals": 18
  },
  {
    "address": "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035",
    "symbol": "USDC",
    "name": "USD Coin",
    "decimals": 6
  },
  {
    "address": "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
    "symbol": "USDT",
    "name": "Tether USD",
    "decimals": 6
  },
  {
    "address": "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4",
    "symbol": "DAI",
    "name": "Dai Stablecoin",
    "decimals": 18
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