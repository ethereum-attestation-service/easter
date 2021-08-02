import "./App.css";
import { PostButton } from "./components/PostButton";
import { useEffect, useState } from "react";
import { getTweets, postMessage, onboard } from "./utils/Utils";
import { Message } from "./components/Message";
import useMetaMask from "./hooks/useMetamask";
import { Header } from "./components/Header";
import { darkBlue } from "./utils/colors";
import TextareaAutosize from "react-textarea-autosize";
import { BigButton } from "./components/BigButton";

function App() {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, metamaskInstalled, setAccount] = useMetaMask();
  const onboardStatus = onboard.getState();
console.log('onStat', onboardStatus)
  async function getMessages() {
    if (account) {
      const messages = await getTweets();
      setMessages(messages);
    }
  }

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

    connectButton: {
      marginTop: 8,
    },
    wrongTitle: {
      fontSize: 30,
      fontWeight: 600,
      textAlign: "center",
      color: darkBlue,
    },
    wrongDescription: {
      fontSize: 16,
      textAlign: "center",
      color: darkBlue,
      marginTop: 20,
    },
  };
  useEffect(() => {
    if (account) {
      getMessages();
    }

  }, [account]);

  return (
    <div style={styles.outer}>
      <Header
        setAccount={setAccount}
        account={account}
      />
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
                      setTimeout(getMessages, 500);
                    }, 50);
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div style={styles.container}>
        <div style={styles.block}>
          {messages === null ? (
            <div>Loading...</div>
          ) : (
            <div>
              {messages.map((message, i) => (
                <Message data={message} key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
