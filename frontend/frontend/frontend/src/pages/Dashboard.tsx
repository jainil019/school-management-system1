import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "ADMIN":
        navigate("/admin", { replace: true });
        break;

      case "TEACHER":
        navigate("/teacher", { replace: true });
        break;

      case "STUDENT":
        navigate("/student", { replace: true });
        break;

      case "PARENT":
        navigate("/parent", { replace: true });
        break;

      case "ACCOUNTANT":
        navigate("/accountant", { replace: true });
        break;

      default:
        break;
    }
  }, [user, navigate]);

  return (
    <div>
      <h1>Loading dashboard...</h1>

      <p>{user?.email}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;