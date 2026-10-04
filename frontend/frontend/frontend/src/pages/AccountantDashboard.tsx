import { useAuth } from "../context/AuthContext";

function AccountantDashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Accountant Dashboard</h1>
      <p>Welcome: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default AccountantDashboard;