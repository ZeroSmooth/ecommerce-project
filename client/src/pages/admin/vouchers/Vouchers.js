import { useState, useEffect, useRef, useCallback } from "react";

function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [stickyHeader, setStickyHeader] = useState(false);
  const tableRef = useRef(null);

  const token = localStorage.getItem("token");

  // ✅ FIX: wrap in useCallback
  const fetchVouchers = useCallback(async () => {
    const res = await fetch(
      "https://ecommerce-project-zpx8.onrender.com/admin/vouchers",
      {
        headers: { Authorization: "Bearer " + token },
      },
    );
    const data = await res.json();
    setVouchers(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const tableTop = tableRef.current.getBoundingClientRect().top;
      setStickyHeader(tableTop <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const createVoucher = async () => {
    if (!code || !value) return alert("Fill all fields");

    await fetch("https://ecommerce-project-zpx8.onrender.com/admin/vouchers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ code, type, value }),
    });

    setCode("");
    setValue("");
    fetchVouchers();
  };

  const saveEdit = async (voucher) => {
    const currentVoucher = vouchers.find((v) => v.id === voucher.id);
    const { id, code, type, value, used } = currentVoucher;
    const usedInt = used === "Yes" ? 1 : 0;

    await fetch(
      `https://ecommerce-project-zpx8.onrender.com/admin/vouchers/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ code, type, value, used: usedInt }),
      },
    );

    setEditingVoucherId(null);
    fetchVouchers();
  };

  const handleChange = (id, field, newValue) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: newValue } : v)),
    );
  };

  return (
    <>
      <h2>Create Voucher</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Voucher Code (SAVE10)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="percent">Percent %</option>
          <option value="amount">Fixed Amount ₱</option>
        </select>
        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
        <button style={{ marginLeft: "10px" }} onClick={createVoucher}>
          Create Voucher
        </button>
      </div>

      <table border="1" style={{ width: "100%" }} ref={tableRef}>
        <thead
          style={{
            backgroundColor: "transparent",
            position: stickyHeader ? "sticky" : "relative",
            top: stickyHeader ? 0 : "auto",
            zIndex: 5,
          }}
        >
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>
                {editingVoucherId === v.id ? (
                  <input
                    type="text"
                    value={v.code}
                    onChange={(e) => handleChange(v.id, "code", e.target.value)}
                  />
                ) : (
                  v.code
                )}
              </td>
              <td>
                {editingVoucherId === v.id ? (
                  <select
                    value={v.type}
                    onChange={(e) => handleChange(v.id, "type", e.target.value)}
                  >
                    <option value="percent">Percent %</option>
                    <option value="amount">Fixed Amount ₱</option>
                  </select>
                ) : (
                  v.type
                )}
              </td>
              <td>
                {editingVoucherId === v.id ? (
                  <input
                    type="number"
                    value={v.value}
                    onChange={(e) =>
                      handleChange(v.id, "value", e.target.value)
                    }
                  />
                ) : v.type === "percent" ? (
                  v.value + "%"
                ) : (
                  "₱" + v.value
                )}
              </td>
              <td>
                {editingVoucherId === v.id ? (
                  <select
                    value={v.used} // will be "Yes" or "No"
                    onChange={(e) => handleChange(v.id, "used", e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : (
                  v.used
                )}
              </td>
              <td>
                {editingVoucherId === v.id ? (
                  <button onClick={() => saveEdit(v)}>Save</button>
                ) : (
                  <button onClick={() => setEditingVoucherId(v.id)}>
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Vouchers;
