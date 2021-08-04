import { darkBlue, grayBlue } from "../utils/colors";
import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import { BigButton } from "./BigButton";
import { postMessage } from "../utils/Utils";

export function ReplyBlock({ user, refUUID, onFinished }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
console.log('trf', refUUID)
  const styles = {
    container: {
      display: "flex",
      justifytContent: "center",
      alignItems: "center",
      marginTop: 8,
      padding: 10,
    },
    input: {
      fontFamily: "Open Sans",
      padding: 8,
      borderRadius: 16,
      border: "1px solid #ddd",
      width: "100%",
      boxSizing: "border-box",
      fontSize: 14,
      outline: 0,
      color: grayBlue,
    },
    button: {
      marginLeft: 8,
    },
  };
  return (
    <div style={styles.container}>
      <TextareaAutosize
        style={styles.input}
        placeholder={`Reply to ${user}`}
        value={input}
        onChange={(e) => setInput(e.target.value.replace("\n", ""))}
      />
      <BigButton
        style={styles.button}
        title={loading ? "Replying..." : "Reply"}
        customFillColor={darkBlue}
        inverted={true}
        onClick={async () => {
          if (loading || !input) return;

          const tx = await postMessage(input, refUUID);

          setLoading(true);

          setTimeout(async () => {
            await tx.wait();

            setLoading(false);
            setInput("");
            setTimeout(onFinished, 1500);
          }, 50);
        }}
      />
    </div>
  );
}
