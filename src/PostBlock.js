import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { PostButton } from "./components/PostButton";
import { postMessage } from "./utils/Utils";

export function PostBlock({ account, onFinished }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = {
    container: {
      margin: "0 auto",
      maxWidth: 800,
      padding: 10,
    },
    block: {
      padding: 12,
      backgroundColor: "#FFF",
      borderRadius: 24,
      marginBottom: 4,
      boxShadow:
        "rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px",
    },
    input: {
      fontFamily: "Open Sans",
      padding: 16,
      borderRadius: 16,
      border: "1px solid #ddd",
      width: "100%",
      boxSizing: "border-box",
      fontSize: 18,
      outline: 0,
    },
    tools: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 8,
    },
  };

  return (
    <div style={styles.container}>
      {account ? (
        <div style={styles.block}>
          <div style={styles.messageInputBlock}>
            <div>
              <TextareaAutosize
                placeholder={"Whats on your mind?"}
                style={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value.replace("\n", ""))}
              />
            </div>
            <div style={styles.tools}>
              <PostButton
                loading={loading}
                onClick={async () => {
                  if (loading || !input) return;

                  const tx = await postMessage(input);

                  setLoading(true);

                  setTimeout(async () => {
                    await tx.wait();

                    setLoading(false);
                    setInput("");
                    setTimeout(onFinished, 500);
                  }, 50);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
