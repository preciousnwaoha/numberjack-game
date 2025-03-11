import { ethers } from "ethers";

export const GAME_CONTRACT_ADDRESS =
  "0x14463737586be49c86f3681FEa3Fa9D9BAA99b6d";
export const TOKEN_CONTACT_ADDRESS =
  "0x6a0e4B320e54DeBA4Adb5412e9cA0a30d4107855";

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
