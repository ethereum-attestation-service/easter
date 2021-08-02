import { useIsSmallScreen } from "./hooks/useIsSmallScreen";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Pill } from "./Pill";

export function Account({ address }) {
  const isSmall = useIsSmallScreen();
  const formattedAddress = ethers.utils.getAddress(address);
  const [username, setUsername] = useState(null);

  async function getUsername() {}

  useEffect(() => {}, []);

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
      <Pill value={'set username'}/>
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
