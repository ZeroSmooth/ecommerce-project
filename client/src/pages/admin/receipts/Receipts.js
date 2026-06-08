import { useEffect, useState, useRef } from "react";

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [stickyHeader, setStickyHeader] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetch("https://ecommerce-project-zpx8.onrender.com/admin/receipts")
      .then((res) => res.json())
      .then((data) => setReceipts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching receipts:", err));
  }, []);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const tableTop = tableRef.current.getBoundingClientRect().top;
      setStickyHeader(tableTop <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "14px",
  };

  const thTdStyle = {
    padding: "8px 12px",
    textAlign: "left",
    border: "1px solid #ccc",
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1>Admin - Receipts</h1>

      {receipts.length === 0 ? (
        <p>No receipts found.</p>
      ) : (
        <table style={tableStyle} ref={tableRef}>
          <thead
            style={{
              backgroundColor: "transparent",
              position: stickyHeader ? "sticky" : "relative",
              top: stickyHeader ? 0 : "auto",
              zIndex: 5,
            }}
          >
            <tr>
              <th style={thTdStyle}>ID</th>
              <th style={thTdStyle}>User</th>
              <th style={thTdStyle}>Address</th>
              <th style={thTdStyle}>Voucher</th>
              <th style={thTdStyle}>Total</th>
              <th style={thTdStyle}>Date</th>
              <th style={thTdStyle}>Items</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td style={thTdStyle}>{receipt.id}</td>
                <td style={thTdStyle}>{receipt.user}</td>
                <td style={thTdStyle}>{receipt.address}</td>
                <td style={thTdStyle}>{receipt.voucher || "None"}</td>
                <td style={thTdStyle}>₱{receipt.total}</td>
                <td style={thTdStyle}>
                  {receipt.date ? new Date(receipt.date).toLocaleString() : "-"}
                </td>
                <td style={thTdStyle}>
                  {(receipt.items || []).map((item, idx) => (
                    <div key={idx}>
                      {item.name} - ₱{item.price || "N/A"} x {item.qty || 1}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Receipts;
