import { useEffect, useState } from "react";
import { Nav, Offcanvas, Form, Container, Image } from "react-bootstrap";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolder,
  FaListUl,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaBell,
  FaSearch,
  FaArrowLeft,
  FaUser,
  FaLock,
} from "react-icons/fa";
import NotificationBellDropdown from "../common/NotificationBellDropdown";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { getTokenExpiration } from "../../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { toast } from "react-toastify";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

// Custom Component for Letter Avatar
const ProfileAvatar = ({ name, size = 38 }: { name: string, size?: number }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <div 
      className="d-flex align-items-center justify-content-center rounded-circle shadow-sm fw-bold"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: "#2563eb", 
        color: "#ffffff",
        fontSize: `${size * 0.45}px`, 
        border: "2px solid #ffffff",
        flexShrink: 0
      }}
    >
      {initial}
    </div>
  );
};

const UILayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("info"); 
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const userData = user?.data ? user.data : user;
  const userName = userData?.name || "Example"; 

  const performLogout = (message: string): void => {
    dispatch(logout());
    toast.info(message, { position: "top-right" });
    window.setTimeout(() => navigate("/login"), 500);
  };

  const handleLogout = (): void => {
    performLogout("You have been logged out.");
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || user?.token || user?.accessToken;
    const expiration = getTokenExpiration(token || null);
    const remainingTime = expiration ? Math.max(expiration - Date.now(), 0) : 15 * 60 * 1000;
    const logoutTimer = window.setTimeout(() => performLogout("Your session has expired. Please log in again."), remainingTime);

    return () => {
      window.clearTimeout(logoutTimer);
    };
  }, [dispatch, navigate, user]);

  const isProfilePage = location.pathname === "/profile" || location.pathname === "/settings";

  const menuItems: MenuItem[] = [
    { path: "/dashboard", name: "Dashboard", icon: <FaHome size={16} /> },
    { path: "/projects", name: "Projects", icon: <FaFolder size={16} /> },
    { path: "/tasks", name: "Tasks", icon: <FaListUl size={16} /> },
    { path: "/calendar", name: "Calendar", icon: <FaCalendarAlt size={16} /> },
    { path: "/notification", name: "Notification", icon: <FaBell size={16} /> },
    { path: "/profile", name: "Settings", icon: <FaCog size={16} /> },
  ];

  const pageTitle = isProfilePage
    ? "Profile Settings"
    : location.pathname.startsWith("/projects/")
      ? "Project Details"
      : menuItems.find((item) => item.path === location.pathname)?.name || "Dashboard";

  const profileMenuItems = [
    { id: "info", label: "Profile Information", icon: <FaUser size={16} /> },
    { id: "password", label: "Change Password", icon: <FaLock size={16} /> },
    { id: "notifications", label: "Notification Settings", icon: <FaBell size={16} /> },
    { id: "account", label: "Account Settings", icon: <FaCog size={16} /> },
  ];

  return (
    <>
      <style>
        {`
          .main-wrapper {
            transition: margin-left 0.3s ease;
            min-width: 0;
            width: 100%;
          }
          @media (min-width: 768px) {
            .main-wrapper {
              margin-left: 250px; 
            }
          }
          @media (max-width: 767.98px) {
            .main-wrapper {
              margin-left: 0; 
            }
          }
        `}
      </style>

      <div className="d-flex min-vh-100" style={{ backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        
        {/* ================= DESKTOP & TABLET SIDEBAR ================= */}
        <div 
          className="d-none d-md-flex flex-column bg-white border-end position-fixed top-0 start-0 h-100"
          style={{ width: "250px", zIndex: 1030, borderColor: "#f1f5f9", padding: "20px 16px" }}
        >
          {isProfilePage ? (
            /* ================= 1. PROFILE SETTINGS SIDEBAR ================= */
            <>
              {/* BACK ARROW + TASKIFY LOGO (Laptop & Tablet View) */}
              <div className="d-flex align-items-center gap-2 mb-4 px-2" style={{ marginTop: "4px" }}>
                <div 
                  onClick={() => navigate("/dashboard")}
                  
                  style={{ width: "34px", height: "34px", cursor: "pointer", borderColor: "#e2e8f0" }}
                  title="Back to Dashboard"
                >
                  <FaArrowLeft size={18} className="text-dark" />
                </div>
                <div className="d-flex align-items-center gap-2 ms-1" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                  <Image src="/logo.png" alt="Logo" width={26} height={26} className="rounded-2 object-fit-cover shadow-sm" />
                  <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>Taskify</h5>
                </div>
              </div>

              <div className="flex-grow-1 mt-2">
                <Nav className="flex-column gap-1">
                  {profileMenuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <Nav.Link
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`rounded-3 px-3 py-2.5 fw-semibold d-flex align-items-center gap-3 transition-all ${
                          isActive ? "text-white shadow-sm" : "text-secondary"
                        }`}
                        style={{ 
                          fontSize: "14px",
                          backgroundColor: isActive ? "#2563eb" : "transparent",
                          color: isActive ? "#ffffff" : "#64748b",
                          cursor: "pointer"
                        }}
                      >
                        {item.icon}
                        <span style={{ marginTop: "1px" }}>{item.label}</span>
                      </Nav.Link>
                    );
                  })}
                </Nav>
              </div>
            </>
          ) : (
            /* ================= 2. NORMAL TASKIFY SIDEBAR ================= */
            <>
              <div className="d-flex align-items-center gap-3 mb-4 px-3" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-2 object-fit-cover shadow-sm" />
                <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>Taskify</h5>
              </div>

              <Nav className="flex-column gap-1 flex-grow-1 mt-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Nav.Link
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                      }}
                      className={`rounded-3 px-3 py-2.5 fw-semibold d-flex align-items-center gap-3 transition-all ${
                        isActive ? "text-white shadow-sm" : "text-secondary"
                      }`}
                      style={{ 
                        fontSize: "14px", 
                        backgroundColor: isActive ? "#2563eb" : "transparent",
                        color: isActive ? "#ffffff" : "#64748b"
                      }}
                    >
                      {item.icon} 
                      <span style={{ marginTop: "1px" }}>{item.name}</span>
                    </Nav.Link>
                  );
                })}
              </Nav>

              {/* Sidebar Bottom: Avatar */}
              <div className="mt-auto pt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
                <div className="d-flex align-items-center justify-content-between px-2 py-1">
                  <div 
                    className="d-flex align-items-center gap-3 overflow-hidden" 
                    style={{ cursor: "pointer" }} 
                    onClick={() => navigate("/profile")}
                    title="View Profile"
                  >
                    <ProfileAvatar name={userName} size={38} />
                    <div className="lh-sm text-start text-truncate">
                      <div className="fw-bolder text-dark mb-1 text-truncate" style={{ fontSize: "15px", maxWidth: "120px" }}>{userName}</div>
                      <div className="text-secondary" style={{ fontSize: "12px" }}>View Profile</div>
                    </div>
                  </div>

                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "#f8fafc", cursor: "pointer" }}
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <FaSignOutAlt color="#ef4444" size={15} style={{ marginLeft: "3px" }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ================= MOBILE OFFCANVAS (Unchanged) ================= */}
        <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="start" className="bg-white border-0" style={{ width: "260px" }}>
          <Offcanvas.Header closeButton className="border-bottom py-3 px-4" style={{ borderColor: "#f1f5f9" }}>
            <Offcanvas.Title className="fw-bolder d-flex align-items-center gap-3 text-dark w-100" style={{ fontSize: "18px" }}>
              {isProfilePage ? (
                <>
                
                    <div 
                  onClick={() => navigate("/dashboard")}
                  
                  style={{ width: "34px", height: "34px", cursor: "pointer", borderColor: "#e2e8f0" }}
                  title="Back to Dashboard"
                >
                  <FaArrowLeft size={18} className="text-dark" />
                  </div>
                 
                  <span style={{ letterSpacing: "-0.3px" }}>Profile Settings</span>
                </>
              ) : (
                <><Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-2 object-fit-cover shadow-sm" /> Taskify</>
              )}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-between p-3">
            {isProfilePage ? (
              <div>
                <Nav className="flex-column gap-1 mt-1">
                  {profileMenuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <Nav.Link
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setShowMobileMenu(false); }}
                        className={`rounded-3 px-3 py-2.5 fw-semibold d-flex align-items-center gap-3 transition-all ${
                          isActive ? "text-white shadow-sm" : "text-secondary"
                        }`}
                        style={{ 
                          fontSize: "14px",
                          backgroundColor: isActive ? "#2563eb" : "transparent",
                          color: isActive ? "#ffffff" : "#64748b",
                          cursor: "pointer"
                        }}
                      >
                        {item.icon}
                        <span style={{ marginTop: "1px" }}>{item.label}</span>
                      </Nav.Link>
                    );
                  })}
                </Nav>
              </div>
            ) : (
              <>
                <Nav className="flex-column gap-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Nav.Link
                        key={item.name}
                        onClick={() => {
                          navigate(item.path);
                          setShowMobileMenu(false);
                        }}
                        className={`rounded-3 px-3 py-2.5 fw-semibold d-flex align-items-center gap-3 ${
                          isActive ? "text-white shadow-sm" : "text-secondary"
                        }`}
                        style={{ fontSize: "14px", backgroundColor: isActive ? "#2563eb" : "transparent", color: isActive ? "#ffffff" : "#64748b" }}
                      >
                        {item.icon} {item.name}
                      </Nav.Link>
                    );
                  })}
                </Nav>

                <div className="mt-auto pt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
                  <div className="d-flex align-items-center justify-content-between px-3 py-1">
                    <div className="d-flex align-items-center gap-3 overflow-hidden" style={{ cursor: "pointer" }} onClick={() => { navigate("/profile"); setShowMobileMenu(false); }}>
                      <ProfileAvatar name={userName} size={38} />
                      <div className="lh-sm text-start text-truncate">
                        <div className="fw-bolder text-dark mb-1 text-truncate" style={{ fontSize: "15px", maxWidth: "120px" }}>{userName}</div>
                        <div className="text-secondary" style={{ fontSize: "12px" }}>View Profile</div>
                      </div>
                    </div>

                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                      style={{ width: "36px", height: "36px", backgroundColor: "#f8fafc", cursor: "pointer" }}
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt color="#ef4444" size={15} style={{ marginLeft: "3px" }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex-grow-1 main-wrapper">
          
          {/* ================= DESKTOP & TABLET HEADER ================= */}
          <div className="d-none d-md-block bg-white px-4 py-3 border-bottom sticky-top shadow-xs" style={{ borderColor: "#e2e8f0", zIndex: 1020 }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.3px", fontSize: "16px" }}>
                  {pageTitle}
                </h6>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative d-none d-lg-block" style={{ width: "240px" }}>
                  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={13} />
                  <Form.Control type="text" placeholder="Search..." className="form-control form-control-sm ps-5 rounded-pill border-0 bg-light shadow-none py-2" style={{ fontSize: "13px" }} />
                </div>

                <div className="d-flex align-items-center gap-4 ps-lg-3 border-start-lg">
                  <NotificationBellDropdown size={20} />

                  <div style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>
                    <ProfileAvatar name={userName} size={36} />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                    className="border-0 bg-transparent text-danger d-flex align-items-center justify-content-center p-0"
                    style={{ width: "28px", height: "28px" }}
                  >
                    <FaSignOutAlt size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= MOBILE HEADER (Unchanged) ================= */}
          <div className="d-md-none bg-white sticky-top shadow-sm border-bottom" style={{ zIndex: 1020, borderColor: "#f1f5f9" }}>
            <div className="d-flex justify-content-between align-items-center px-3" style={{ height: "64px" }}>
              <div className="d-flex align-items-center gap-3">
                <FaBars size={20} className="text-dark" onClick={() => setShowMobileMenu(true)} style={{ cursor: "pointer" }} />
                <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>
                  {pageTitle}
                </h5>
              </div>

              <div className="d-flex align-items-center gap-3">
                <NotificationBellDropdown size={20} />

                <div style={{ cursor: "pointer" }} onClick={() => navigate("/profile")}>
                  <ProfileAvatar name={userName} size={32} />
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="border-0 bg-transparent text-danger d-flex align-items-center justify-content-center p-0"
                  style={{ width: "28px", height: "28px" }}
                >
                  <FaSignOutAlt size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ================= CONTENT AREA ================= */}
          {isProfilePage ? (
            <Container fluid className="px-3 py-4 p-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
              <Outlet context={{ activeTab }} />
            </Container>
          ) : (
            <div className="p-0">
              <Outlet />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default UILayout;