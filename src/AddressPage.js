import "./App.css";
import { useEffect, useState } from "react";
import {getTweets, getTweetsFromAddress} from "./utils/Utils";
import { Message } from "./components/Message";
import { Header } from "./components/Header";
import { PostBlock } from "./PostBlock";

function AddressPage({match}) {
  const [messages, setMessages] = useState(null);
  const [account, setAccount] = useState(null);
  const { address } = match.params;

  async function getMessages() {
    if (account) {
      const messages = await getTweetsFromAddress(address);
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
  };
  useEffect(() => {
    if (account) {
      getMessages();
    }
  }, [account]);

  return (
    <div style={styles.outer}>
      <Header setAccount={setAccount} account={account} />

      <PostBlock
        account={account}
        onFinished={() => {
          document.location = '/';
        }}
      />

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

export default AddressPage;
