import "./App.css";
import { PostButton } from "./PostButton";
import { useEffect, useState } from "react";
import { getTweets, postMessage } from "./Utils";
import { Message } from "./Message";
import useMetaMask from "./hooks/useMetamask";
import { BigButton } from "./BigButton";

function App() {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, metamaskInstalled, setAccount] = useMetaMask();

  async function getMessages() {
    const messages = await getTweets();
    setMessages(messages);
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    },
    block: {
      maxWidth: 800,
      padding: 20,
      flexGrow: 1,
      backgroundColor: "#FFF",
      borderRadius: 8,
      marginTop: 20,
    },
    input: {
      padding: 16,
      borderRadius: 6,
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
    title: {
      color: "#FFF",
      fontSize: 34,
      fontWeight: "600",
      textAlign: "center",
      width: "100%",
      marginTop: 20,
    },
    connectButton: {
      marginTop: 8,
    },
  };
  useEffect(() => {

    getMessages();
  }, []);

  return (
    <div style={styles.outer}>
      <div style={styles.title}>EAS-ter</div>
      <div style={styles.container}>
        {!metamaskInstalled ? (
          <div>Metamask required to post</div>
        ) : !account ? (
          <div>
            <BigButton
              title={"Connect wallet to post"}
              style={styles.connectButton}
              onClick={async () => {
                const accounts = await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
                const account = accounts[0];

                setAccount(account);
              }}
            />
          </div>
        ) : (
          <div style={styles.block}>
            <div style={styles.messageInputBlock}>
              <div>
                <input
                  type="text"
                  placeholder={"Whats on your mind?"}
                  style={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div style={styles.tools}>
                <PostButton
                  loading={loading}
                  onClick={async () => {
                    if (loading) return;

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
        )}
      </div>

      <div style={styles.container}>
        <div style={styles.block}>
          {messages === null ? (
            <div>Loading...</div>
          ) : (
            <div>
              {messages.map((message) => (
                <Message data={message} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
