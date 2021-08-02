import { darkBlue } from "../utils/colors";
import { onboard } from "../utils/Utils";
import { BigButton } from "./BigButton";
import { Account } from "./Account";
import { useEffect } from "react";
import { useIsSmallScreen } from "../hooks/useIsSmallScreen";

export function Header({ account, setAccount }) {
  const isSmall = useIsSmallScreen();

  const savedString = "MetaMask";
  const styles = {
    container: {
      margin: "0 auto",
      padding: isSmall?10:20,
      paddingTop: 10,
      display: isSmall ? "block" : "flex",
      justifyContent: "space-between",
      alignItems: "center",

      boxSizing: "border-box",
    },
    title: {
      marginBottom: isSmall? 10: 0,
      fontFamily: "Roboto Mono",
      color: darkBlue,
      fontSize: 24,
      fontWeight: 600,
      textAlign: "center",
      width: "100%",
    },
  };

  useEffect(() => {
    async function select() {
      const select = await onboard.walletSelect(savedString);
      if (select) {
        await connectWallet();
      }
    }

    select();
  }, []);

  async function connectWallet() {
    const check = await onboard.walletCheck();
    if (check) {
      const state = onboard.getState();
      setAccount(state.address);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.title}>EASter</div>
      </div>
      <div style={styles.right}>
        {!account ? (
          <BigButton
            title={"Connect wallet"}
            style={styles.connectButton}
            customFillColor={darkBlue}
            // customWhiteColor={"#000"}
            onClick={async () => {
              await onboard.walletSelect();

              await connectWallet();
            }}
          />
        ) : (
          <div>
            <Account address={account} setAccount={setAccount} />
          </div>
        )}
      </div>
    </div>
  );
}
