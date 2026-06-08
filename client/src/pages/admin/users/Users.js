import { useState, useEffect, useRef } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [stickyHeader, setStickyHeader] = useState(false);
  const tableRef = useRef(null);

  // ❌ REMOVE TOKEN FROM LOCALSTORAGE
  // const token = localStorage.getItem("token");

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/admin/users", {
      credentials: "include", // ⭐ IMPORTANT (cookies)
    });

    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     STICKY HEADER
  ========================= */
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      const tableTop = tableRef.current.getBoundingClientRect().top;
      setStickyHeader(tableTop <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================
     DELETE USER
  ========================= */
  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include", // ⭐ IMPORTANT
    });

    fetchUsers();
  };

  /* =========================
     SAVE USER
  ========================= */
  const saveUser = async () => {
    await fetch(`http://localhost:5000/admin/users/${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ⭐ IMPORTANT
      body: JSON.stringify(editingUser),
    });

    setEditingUser(null);
    fetchUsers();
  };

  /* =========================
     FILTER USERS
  ========================= */
  const filteredUsers = users.filter((u) => {
    const search = userSearch.toLowerCase();
    return (
      u.id.toString().includes(search) ||
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <input
        type="text"
        placeholder="Search users..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        style={{ marginBottom: "10px" }}
      />

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
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>

              <td>
                {editingUser?.id === u.id ? (
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                  />
                ) : (
                  u.username
                )}
              </td>

              <td>
                {editingUser?.id === u.id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  u.email
                )}
              </td>

              <td>
                {editingUser?.id === u.id ? (
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>

              <td>
                {editingUser?.id === u.id ? (
                  <button onClick={saveUser}>Save</button>
                ) : (
                  <button onClick={() => setEditingUser({ ...u })}>Edit</button>
                )}
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Users;
