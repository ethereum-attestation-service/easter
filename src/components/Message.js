import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { grayBlue } from "../utils/colors";
import Linkify from "react-linkify";

dayjs.extend(relativeTime);

export function Message({ data }) {
  const { username, from, time, message, rawData } = data;
  const timeSinceStr = dayjs().to(dayjs.unix(ethers.BigNumber.from(time)));
  const formattedAddress = `${from.substr(0, 6)}...${from.substr(-4, 4)}`;

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
  };
  return (
    <div style={styles.container}>
      <div style={styles.user}>
        {username ? username : formattedAddress}{" "}
        <span style={styles.time}>- {timeSinceStr}</span>
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
