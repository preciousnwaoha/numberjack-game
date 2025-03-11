import { JsonRpcSigner } from "ethers";
import { useEffect } from "react";

interface UseNetworkProps {
    setConnected: React.Dispatch<React.SetStateAction<boolean>>;
    setClientPlayerAddress: React.Dispatch<React.SetStateAction<string>>;
    setSigner: React.Dispatch<React.SetStateAction<JsonRpcSigner | null>>;
}

const useNetwork = ({
    setConnected,
    setClientPlayerAddress,
    setSigner,
}: UseNetworkProps) => {
    // Listen for account or network changes and update connection state accordingly.
      useEffect(() => {
        if (window.ethereum) {
          const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
              // Wallet disconnected or locked
              setConnected(false);
              setClientPlayerAddress("");
              setSigner(null);
            } else {
              // Optionally, update the current account.
              setClientPlayerAddress(accounts[0]);
            }
          };
    
          const handleChainChanged = () => {
            // Reloading ensures the app resets with the new network.
            window.location.reload();
          };
    
          window.ethereum.on("accountsChanged", () => handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
    
          return () => {
            if (window.ethereum && window.ethereum.removeListener) {
              window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
              );
              window.ethereum.removeListener("chainChanged", handleChainChanged);
            }
          };
        }
      }, []);
    
      // Optionally, check on load if the user already connected (without forcing connection).
      useEffect(() => {
        if (window.ethereum && window.ethereum.selectedAddress) {
          // If an address is already available, you may want to update state,
          // but you might also wait for a manual re-connect for better UX.
          setClientPlayerAddress(window.ethereum.selectedAddress);
          setConnected(true);
        }
      }, []);

      
}

export default useNetwork;