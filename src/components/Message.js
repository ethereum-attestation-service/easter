import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { darkBlue, grayBlue } from "../utils/colors";
import Linkify from "react-linkify";
import AttestationDialog from "./AttestationDialog";
import { useState } from "react";
import { navigateToAddress, revokeMessage } from "../utils/Utils";

dayjs.extend(relativeTime);

export function Message({ data, account }) {
  const { username, from, time, message } = data;
  const timeSinceStr = dayjs().to(dayjs.unix(ethers.BigNumber.from(time)));
  const formattedAddress = `${from.substr(0, 6)}...${from.substr(-4, 4)}`;
  const [detailsOpen, setDetailsOpen] = useState(false);
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
      fontSize: 14,
      cursor: "pointer",
      color: grayBlue,
      textDecoration: "underline",
    },
  };

  if (hidden) return null;

  return (
    <div style={styles.container}>
      {/*{detailsOpen ? (*/}
      {/*  <AttestationDialog*/}
      {/*    onClose={() => setDetailsOpen(false)}*/}
      {/*    attestationData={data}*/}
      {/*  />*/}
      {/*) : null}*/}
      <div style={styles.top}>
        <div style={styles.user} onClick={() => navigateToAddress(from)}>
          {username ? username : formattedAddress}{" "}
          <span style={styles.time}>- {timeSinceStr}</span>
        </div>
        <div>
          {/*<div style={styles.details} onClick={() => setDetailsOpen(true)}>*/}
          {/*  Details*/}
          {/*</div>*/}

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
            {account === from ? (hiding ? "Hiding..." : "Hide") : null}
          </div>
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
    </div>
  );
}
