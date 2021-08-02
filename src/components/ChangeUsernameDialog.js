import React, { useState } from "react";
import { Dialog } from "./Dialog";
import { darkBlue, lightBlue } from "../utils/colors";
import { BigButton } from "./BigButton";
import {setUsername} from "../utils/Utils";

export function ChangeUsernameDialog({ username, onFinished }) {
  const [input, setInput] = useState(username);
  const [setting, setSetting] = useState(false);
  const styles = {
    container: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      textAlign: "center",
      color: darkBlue,
    },
    input: {
      borderRadius: 8,
      width: 200,
      border: `1px solid ${darkBlue}`,
      marginRight: -6,
      borderRight: 0,
      fontSize: 16,
      color: darkBlue,
      padding: 8,
      outline: 0,
    },
  };
  return (
    <Dialog
      width={800}
      isVisible={true}
      title={"Set username"}
      onClose={()=>onFinished()}
      body={
        <div style={styles.container}>
          <input
            type="text"
            value={input}
            style={styles.input}
            onChange={(e) => setInput(e.target.value)}
          />
          <BigButton
            title={setting?"Setting...":"Set username"}
            inverted={true}
            customFillColor={darkBlue}
            onClick={async ()=> {
              if (setting) {
                return;
              }

              const tx = await setUsername(input);
              setSetting(true);
              await tx.wait();
              setSetting(false)
              onFinished(input);
            }}
          />
        </div>
      }
    />
  );
}
