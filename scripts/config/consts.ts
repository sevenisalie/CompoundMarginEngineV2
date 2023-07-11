import TOKENLIST from "./TOKENLIST.json"
import V3FACTORYABI from "./v3FactoryAbi.json"
import V3ROUTERABI from "./v3SwapRouterAbi.json"
import V3POOLABI from "./v3Pool.json"
import V3QUOTERABI from "./quickSwapQuoter.json"
import * as ethers from "ethers"

export const provider = new ethers.providers.JsonRpcProvider("https://maximum-polished-card.discover.quiknode.pro/3278539368889c7eed4ce06a7f318f9da4b1d53a/")
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

export const BackRunFLContract = "0xBBc8571386d041Aa9944D79B1bB53C251B72c160"
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

export const v3Markets = [
  {
    address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    name: "quickswap",
    initCode: "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"
  },
]
export const v2Markets = [
  {
    factory: "0xCf083Be4164828f00cAE704EC15a36D711491284", // Apeswap
    router: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
    fee: 998,
    feeBase: 1000,
    initCodeHash:
      "0x511f0f358fe530cda0859ec20becf391718fdf5a329be02f4c95361f3d6a42d8",
    name: "APESWAP",
  },
  {
    factory: "0x800b052609c355cA8103E06F022aA30647eAd60a", // Cometh Swap
    router: "0x93bcDc45f7e62f89a8e901DC4A0E2c6C427D9F25",
    fee: 995,
    feeBase: 1000,
    initCodeHash:
      "0x499154cad90a3563f914a25c3710ed01b9a43b8471a35ba8a66a056f37638542",
    name: "COMETH",
  },
  {
    factory: "0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B", // Dfyn
    router: "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0xf187ed688403aa4f7acfada758d8d53698753b998a3071b06f1b777f4330eaf3",
    name: "DFYN",
  },
  {
    factory: "0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a", // Elk Finance
    router: "0xf38a7A7Ac2D745E2204c13F824c00139DF831FFf",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31",
    name: "ELK",
  },
  {
    factory: "0x3ed75AfF4094d2Aaa38FaFCa64EF1C152ec1Cf20", // Gravity
    router: "0x57dE98135e8287F163c59cA4fF45f1341b680248",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0x59f0dd0ec2453a509915048cac1608e1a52938dbcdf6b4960b21592e7996743a",
    name: "GRAVITY",
  },
  {
    factory: "0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7", // Jetswap
    router: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
    fee: 999,
    feeBase: 1000,
    initCodeHash:
      "0x505c843b83f01afef714149e8b174427d552e1aca4834b4f9b4b525f426ff3c6",
    name: "JETSWAP",
  },
  {
    factory: "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA", // Polycat
    router: "0x94930a328162957FF1dd48900aF67B5439336cBD",
    fee: 9976,
    feeBase: 10000,
    initCodeHash:
      "0x3cad6f9e70e13835b4f07e5dd475f25a109450b22811d0437da51e66c161255a",
    name: "POLYCAT",
  },
  {
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", // Quickswap
    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    name: "QUICKSWAP",
  },
  {
    factory: "0xB581D0A3b7Ea5cDc029260e989f768Ae167Ef39B", // Radio Shack
    router: "0xAf877420786516FC6692372c209e0056169eebAf",
    fee: 999,
    feeBase: 1000,
    initCodeHash:
      "0x3eef69365a159891ca18b545ccaf0d6aca9b22c988b8deb7a3e4fa2fc2418596",
    name: "RADIO_SHACK",
  },
  {
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4", // Sushiswap
    router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303",
    name: "SUSHISWAP",
  },
  {
    factory: "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef", // Wault Swap
    router: "0x3a1D87f206D12415f5b0A33E786967680AAb4f6d",
    fee: 998,
    feeBase: 1000,
    initCodeHash:
      "0x1cdc2246d318ab84d8bc7ae2a3d81c235f3db4e113f4c6fdc1e2211a9291be47",
    name: "WAULT_SWAP",
  },
  {
    factory: "0x5BdD1CD910e3307582F213b33699e676E61deaD9", // Polydex
    router: "0xC60aE14F2568b102F8Ca6266e8799112846DD088", // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0x8cb41b27c88f8934c0773207afb757d84c4baa607990ad4a30505e42438d999a",
    name: "POLYDEX",
  },
  {
    factory: "0x293f45b6F9751316672da58AE87447d712AF85D7", // Vulcan
    router: "0xfE0E493564DB7Ae23a7b6Ea07F2C633Ee8f25f22",
    fee: 997,
    feeBase: 1000,
    initCodeHash:
      "0x6ef78d7709026f20d23d9a4f267d7350f69949442295ac090da495c5696bcafe",
    name: "VULCAN",
  },
  {
    factory: "0x624Ccf581371F8A4493e6AbDE46412002555A1b6", // Dino
    router: "0x6AC823102CB347e1f5925C634B80a98A3aee7E03",
    fee: 9982,
    feeBase: 10000,
    initCodeHash:
      "0x6a733b8ac43b9d683a3035801788767d1b63c7998154ab1d6379b011dc98a9b8",
    name: "DINO_SWAP",
  },
]

export const functionSelectors = {
  "0xfb3bdb41": {
    functionName: "swapExactETHForExactTokens",
    textSignature: "swapETHForExactTokens(uint256,address[],address,uint256)"
  },
  "0x7ff36ab5": {
    functionName: "swapExactETHForTokens",
    textSignature: "swapExactETHForTokens(uint256,address[],address,uint256)"
  },
  "0x18cbafe5": {
    functionName: "swapExactTokensForETH",
    textSignature: "swapExactTokensForETH(uint256,uint256,address[],address,uint256)"
  },
  "0x38ed1739": {
    functionName: "swapExactTokensForTokens",
    textSignature: "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"
  },

  "0x4a25d94a": {
    functionName: "swapTokensForExactETH",
    textSignature: "swapTokensForExactETH(uint256,uint256,address[],address,uint256)"
  },
  "0x8803dbee": {
    functionName: "swapTokensForExactTokens",
    textSignature: "swapTokensForExactTokens(uint256,uint256,address[],address,uint256)"
  }

}

export const tokens = {
  matic: {
    BTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    MATIC: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    MiMATIC: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
    DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    COB: "0x648FA1E7Dd2722Ba93EC4Da99f2C32347522a37C",
    DINO: "0xAa9654BECca45B5BDFA5ac646c939C62b527D394",
    LINK: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
    SUSHI: "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a",
    FISH: '0x3a3df212b7aa91aa0402b9035b098891d276572b',
    OMEN: "0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E",
    UNI: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
    AAVE: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
    GRT: "0x5fe2b58c013d7601147dcdd68c143a77499f5531",
    COMP: "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c",
    SNX: "0x50b728d8d964fd00c2d0aad81718b71311fef68a",
    CRV: "0x172370d5cd63279efa6d502dab29171933a610af",
    lp: {
      COBUSDC: "0x6A0eF6b58331Ff3e6fdAB1a8C0B24D664F31896a"
    },
  }
}