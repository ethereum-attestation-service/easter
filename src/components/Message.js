import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { grayBlue } from "../utils/colors";
import Linkify from "react-linkify";
import { useState } from "react";
import {
  formatGraphMessages,
  navigateToAddress,
  revokeMessage,
} from "../utils/Utils";
import { ReplyBlock } from "./ReplyBlock";

dayjs.extend(relativeTime);

export function Message({ data, account }) {
  const { username, from, time, message, refUUID, uuid, relatedMessages } =
    data;
  const timeSinceStr = dayjs().to(dayjs.unix(ethers.BigNumber.from(time)));
  const formattedAddress = `${from.substr(0, 6)}...${from.substr(-4, 4)}`;
  const [replyOpen, setReplyOpen] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [hidden, setHidden] = useState(false);

  const styles = {
    container: {
      padding: "20px 10px",
      borderBottom: "1px solid #eee",
      overflow: "hidden",
    },
    user: {
      fontWeight: "600",
      color: grayBlue,
      textOverflow: "wrap",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      cursor: "pointer",
    },
    message: {
      color: grayBlue,
    },
    time: {
      color: "rgb(83, 100, 113)",
      fontWeight: 400,
    },
    top: {
      display: "flex",
      justifyContent: "space-between",
    },
    details: {
      display: "inline-block",
      marginRight: 8,
      fontSize: 14,
      cursor: "pointer",
      color: grayBlue,
      textDecoration: "underline",
    },
    tools: {
      marginTop: 10,
    },
  };

  if (hidden) return null;

  return (
    <div style={styles.container}>
      <div style={styles.top}>
        <div style={styles.user} onClick={() => navigateToAddress(from)}>
          {username ? username : formattedAddress}{" "}
          <span style={styles.time}>- {timeSinceStr}</span>
        </div>
      </div>
      <div style={styles.message}>
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="blank" href={decoratedHref} key={key}>
              {decoratedText}
            </a>
          )}
        >
          {message}
        </Linkify>
      </div>


      <div style={styles.tools}>
        {account &&
        ethers.utils.getAddress(account) === ethers.utils.getAddress(from) ? (
          <div
            style={styles.details}
            onClick={async () => {
              const tx = await revokeMessage(data.uuid);

              if (tx) {
                setHiding(true);
                await tx.wait();
                setHiding(false);
                setHidden(true);
              }
            }}
          >
            {hiding ? "Hiding..." : "Hide"}
          </div>
        ) : null}

        {replyOpen ? (
          <ReplyBlock user={username ? username : from} refUUID={uuid} />
        ) : null}

        <div style={styles.details} onClick={async () => setReplyOpen(true)}>
          Reply
        </div>
      </div>

      {relatedMessages?.length ? (
        <div style={styles.replies}>
          {formatGraphMessages(relatedMessages).map((message) => (
            <Message account={account} data={message} />
          ))}
        </div>
      ) : null}

    </div>
  );
}
