import { darkBlue, lightBlue } from "../utils/colors";

export function Pill({ value, color='#FFF', fontFamily="Roboto Mono", onClick }) {
  const styles = {
    container: {
      fontFamily: fontFamily,
      backgroundColor: color,
      color: darkBlue,
      fontWeight: 600,
      padding: "8px 10px",
      borderRadius: 12,
      fontSize: 16,
      cursor: 'pointer'
    },
  };
  return <div style={styles.container} onClick={onClick}>{value}</div>;
}
