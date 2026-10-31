import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Deliberately NOT given data-testid attributes (see fixture-app spec §4):
// this is one of the "fragile, structural-locator" surfaces the test suite
// exercises on purpose. Tests here rely on link text / nav structure.
export function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Mini App</div>
      <div className="navbar-links">
        <NavLink to="/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
          Tasks
        </NavLink>
        <NavLink to="/tasks/new" className={({ isActive }) => (isActive ? "active" : "")}>
          New Task
        </NavLink>
      </div>
      <div className="navbar-user">
        {user && <span className="navbar-username">{user.displayName}</span>}
        <button className="nav-signout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
