import {darkBlue} from "./utils/colors";

export function PostButton({ onClick, loading }) {
  const styles = {
    container: {
      backgroundColor: darkBlue,
      color: "#FFF",
      display: "inline-flex",
      alignItems: 'center',
      padding: "8px 16px",
      borderRadius: 16,
      height: 30,
      fontWeight: "700",
      fontSize: 16,
      cursor: "pointer",
    },
  };
  return (
    <div style={styles.container} onClick={onClick}>
      {loading ? "Posting..." : "Post forever"}
    </div>
  );
}
