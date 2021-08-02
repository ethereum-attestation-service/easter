import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { darkBlue, grayBlue } from "../utils/colors";
import Linkify from "react-linkify";
import AttestationDialog from "./AttestationDialog";
import { useState } from "react";

dayjs.extend(relativeTime);

export function Message({ data }) {
  const { username, from, time, message, rawData } = data;
  const timeSinceStr = dayjs().to(dayjs.unix(ethers.BigNumber.from(time)));
  const formattedAddress = `${from.substr(0, 6)}...${from.substr(-4, 4)}`;
  const [detailsOpen, setDetailsOpen] = useState(false);

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
  return (
    <div style={styles.container}>
      {detailsOpen ? (
        <AttestationDialog
          onClose={() => setDetailsOpen(false)}
          attestationData={rawData}
        />
      ) : null}
      <div style={styles.top}>
        <div style={styles.user}>
          {username ? username : formattedAddress}{" "}
          <span style={styles.time}>- {timeSinceStr}</span>
        </div>
        <div>
          <div style={styles.details} onClick={() => setDetailsOpen(true)}>
            Details
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
