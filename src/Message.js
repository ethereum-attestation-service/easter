import { ethers } from "ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function Message({data}) {
  const {username, from, time, message} = data;
  const timeSinceStr = dayjs().to(dayjs.unix(ethers.BigNumber.from(time)));

  const styles = {
    container: {
      padding: "20px 10px",
      borderBottom: '1px solid #eee'
    },
    user: {
      fontWeight: '600'
    },
    time: {
      color: 'rgb(83, 100, 113)',
      fontWeight: 400
    }
  }
  return <div style={styles.container}>
    <div style={styles.user}>{username?username:from} <span style={styles.time}>- {timeSinceStr}</span></div>
    <div>{message}</div>
  </div>;
}
