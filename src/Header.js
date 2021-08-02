import { darkBlue } from "./utils/colors";
import { BigButton } from "./BigButton";
import { Account } from "./Account";
import {useIsSmallScreen} from "./hooks/useIsSmallScreen";

export function Header({ account, metamaskInstalled, setAccount }) {
  const isSmall = useIsSmallScreen()

  const styles = {
    container: {
      margin: "0 auto",
      marginTop: 10,
      marginBottom: 10,
      maxWidth: 800,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 20,
      boxSizing: "border-box",
    },
    title: {
      color: darkBlue,
      fontSize: 24,
      fontWeight: "600",
      textAlign: "center",
      width: "100%",
      // marginTop: 20,
    },
  };
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.title}>EASter</div>
      </div>
      <div style={styles.right}>
        {!metamaskInstalled ? (
          <div>
            <BigButton title={"Install Metamask"} />
          </div>
        ) : !account ? (
          <BigButton
            title={"Connect wallet to post"}
            style={styles.connectButton}
            customFillColor={darkBlue}
            // customWhiteColor={"#000"}
            onClick={async () => {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              const account = accounts[0];

              setAccount(account);
            }}
          />
        ) : (
          <div>
            <Account address={account} />
          </div>
        )}
      </div>
    </div>
  );
}
