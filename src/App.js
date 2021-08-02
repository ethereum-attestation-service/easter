import "./App.css";
import { PostButton } from "./PostButton";
import { useEffect, useState } from "react";
import { getTweets, postMessage } from "./utils/Utils";
import { Message } from "./Message";
import useMetaMask from "./hooks/useMetamask";
import { Header } from "./Header";
import {darkBlue} from "./utils/colors";
import TextareaAutosize from 'react-textarea-autosize';

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
      fontFamily: 'Open Sans',
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
      textAlign: 'center',
      color: darkBlue
    },
    wrongDescription: {
      fontSize: 16,
      textAlign: 'center',
      color: darkBlue,
      marginTop: 20,
    }
  };
  useEffect(() => {
    if (window?.ethereum?.chainId === "0x4") {
      getMessages();
    }

    window?.ethereum?.on("chainChanged", (_chainId) => window.location.reload());
  }, []);

  return window?.ethereum?.chainId === "0x4" ? (
    <div style={styles.outer}>
      <Header
        account={account}
        setAccount={setAccount}
        metamaskInstalled={metamaskInstalled}
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
                  onChange={(e) => setInput(e.target.value.replace('\n', ''))}
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
        ) : null}
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
  ) : (
    <div style={{...styles.container}}>
      <div style={styles.wrongTitle}>Wrong Network!</div>
      <div style={styles.wrongDescription}>Switch to Rinkeby in your ethereum browser wallet (Metamask)</div>
    </div>
  );
}

export default App;
