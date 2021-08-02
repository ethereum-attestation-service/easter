import {useEffect, useState} from "react";

export default function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [metamaskInstalled, setMetamaskInstalled] = useState(null);

  useEffect(() => {


    // if (typeof window.ethereum !== "undefined") {
    //   setMetamaskInstalled(true);
    //
    //   setTimeout(() => {
    //     if (window.ethereum.selectedAddress) {
    //       setAccount(window.ethereum.selectedAddress);
    //     }
    //   }, 500);
    // }
  }, []);

  return [account, metamaskInstalled, setAccount];
}
