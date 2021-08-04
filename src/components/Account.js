import { useIsSmallScreen } from "../hooks/useIsSmallScreen";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Pill } from "./Pill";
import {getBalance, getUsername, getUsernameGraph, onboard} from "../utils/Utils";
import { ChangeUsernameDialog } from "./ChangeUsernameDialog";

export function Account({ address, setAccount }) {
  const isSmall = useIsSmallScreen();
  const formattedAddress = ethers.utils.getAddress(address);
  const [username, setUsername] = useState(null);
  const [balance, setBalance] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);

  async function getUser() {
    const username = await getUsernameGraph(address);
    setUsername(username);

    const balance = await getBalance(address);
    const ethBalance = ethers.utils.formatEther(balance);
    setBalance(Number(ethBalance).toFixed(3));
  }

  useEffect(() => {
    getUser();
  }, [address]);

  const styles = {
    container: {
      display: "flex",
      justifyContent: isSmall?"space-between":"flex-start",
    },

    separator: {
      width: 8,
    },
  };
  return (
    <div style={styles.container}>
      {editingUsername ? (
        <ChangeUsernameDialog
          username={username}
          onFinished={(username) => {
            if (username) {
              setUsername(username);
            }
            setEditingUsername(false);
          }}
        />
      ) : null}
      <Pill
        value={username ? username : "set username"}
        onClick={() => setEditingUsername(true)}
      />
      <div style={styles.separator}></div>
      <Pill
        value={balance + 'ETH'}
      />
      <div style={styles.separator}></div>
      <Pill
        onClick={async () => {
          const select = await onboard.walletSelect();
          if (select) {
            const check = await onboard.walletCheck();
            if (check) {
              const state = onboard.getState();
              setAccount(state.address);
            }
          }
        }}
        value={`${formattedAddress.substr(0, 6)}...${formattedAddress.substr(
          -4,
          4
        )}`}
      />
    </div>
  );
}
