import { useIsSmallScreen } from "../hooks/useIsSmallScreen";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Pill } from "./Pill";
import { getUsername } from "../utils/Utils";
import { ChangeUsernameDialog } from "./ChangeUsernameDialog";

export function Account({ address }) {
  const isSmall = useIsSmallScreen();
  const formattedAddress = ethers.utils.getAddress(address);
  const [username, setUsername] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);

  async function getUser() {
    const username = await getUsername(address);
    setUsername(username);
  }

  useEffect(() => {
    getUser();
  }, []);

  const styles = {
    container: {
      display: "flex",
      justifyContent: "flex-start",
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
        value={`${formattedAddress.substr(0, 6)}...${formattedAddress.substr(
          -4,
          4
        )}`}
      />
    </div>
  );
}
