// src/components/Sidebar.jsx (partial update)
// ... existing imports

const Sidebar = () => {
    return (
      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fas fa-bell"></i>
                <span>Alert Configuration</span>
              </NavLink>
            </li>
            {/* Other navigation items */}
          </ul>
        </nav>
      </div>
    );
  };
  
  export default Sidebar;