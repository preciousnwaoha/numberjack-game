import { ethers } from "ethers";

export const GAME_CONTRACT_ADDRESS =
  "0xcB2BD64d4dB8c66ac17432B49afa2d25B5CA6BbD";
export const TOKEN_CONTACT_ADDRESS =
  "0x73d39Dd5D2e2F85A018b79402626cD685b2E8B8A";

export const CORE_CHAIN_ID = 1114;
export const CORE_CHAIN_NETWORK_NAME = "Core Blockchain TestNet"
export const CORE_CHAIN_CURRENCY_SYMBOL = "TCORE2"
export const CORE_CHAIN_URL = "https://rpc.test2.btcs.network";
export const CORE_CHAIN_BLOCK_EXPLORER = "https://scan.test2.btcs.network";

export const RANDOM_GOOFY_NAMES = ["beast", "artic", "burn"];

export const SERVER_URL = "http://localhost:5000";

export const MIN_FEE = 0.001;

export const TIME_TO_PLAY = 30;

export const CORE_CHAIN_CONFIG = {
  chainId: ethers.toQuantity(CORE_CHAIN_ID),
  chainName: CORE_CHAIN_NETWORK_NAME,
  nativeCurrency: {
    name: "Test Core 2",
    symbol: CORE_CHAIN_CURRENCY_SYMBOL,
    decimals: 18,
  },
  rpcUrls: [CORE_CHAIN_URL],
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};
