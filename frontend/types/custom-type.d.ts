import type { MetaMaskInpageProvider } from '@metamask/providers';



export {}; // This makes the file a module

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}