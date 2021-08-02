export function PostButton({ onClick, loading }) {
  const styles = {
    container: {
      backgroundColor: "#46acff",
      color: "#FFF",
      display: "inline-block",
      padding: "8px 16px",
      borderRadius: 20,
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
