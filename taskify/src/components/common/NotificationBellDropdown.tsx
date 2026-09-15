import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBell,
  FaListUl,
  FaBriefcase,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";
import { useNotifications, type NotificationItem } from "../../hooks/useNotifications";

interface NotificationBellDropdownProps {
  size?: number;
  className?: string;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  size = 20,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, dismissNotification } = useNotifications();

  const [show, setShow] = useState<boolean>(false);

  // Automatically close dropdown whenever route changes
  useEffect(() => {
    setShow(false);
  }, [location.pathname]);

  // Exactly 2 notifications maximum in header dropdown as requested by the user
  const previewList = notifications.slice(0, 2);

  const handleItemClick = (notif: NotificationItem) => {
    setShow(false);
    dismissNotification(notif.id);
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate("/notification");
    }
  };

  const handleViewAll = () => {
    setShow(false);
    navigate("/notification");
  };

  // Dynamic icon and colors based on task vs project type
  const getItemIconConfig = (notif: NotificationItem) => {
    switch (notif.type) {
      case "project":
        return {
          icon: <FaBriefcase size={15} />,
          bg: "#eff6ff",      // light blue
          color: "#2563eb",   // vibrant blue
        };
      case "completed":
        return {
          icon: <FaCheckCircle size={15} />,
          bg: "#ecfdf5",      // light green
          color: "#10b981",   // emerald green
        };
      case "urgent":
        return {
          icon: <FaExclamationCircle size={15} />,
          bg: "#fef2f2",      // light red
          color: "#ef4444",   // red
        };
      case "deadline":
        return {
          icon: <FaClock size={15} />,
          bg: "#fffbeb",      // light amber
          color: "#f59e0b",   // amber
        };
      case "task":
      default:
        return {
          icon: <FaListUl size={15} />,
          bg: "#f5f3ff",      // light indigo
          color: "#6366f1",   // indigo
        };
    }
  };

  return (
    <Dropdown
      show={show}
      onToggle={(nextShow) => setShow(nextShow)}
      align="end"
      className={`position-relative ${className}`}
    >
      <style>{`
        /* Remove Bootstrap's default dropdown caret arrow */
        .header-bell-toggle::after,
        .dropdown-toggle::after {
          display: none !important;
          content: none !important;
        }

        .header-notif-dropdown {
          width: 350px;
          max-width: 92vw;
          border-radius: 18px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.12);
          padding: 0;
          overflow: hidden;
          margin-top: 12px !important;
          background-color: #ffffff;
        }

        .header-notif-item {
          padding: 14px 18px;
          transition: background-color 0.15s ease;
          cursor: pointer;
          border-bottom: 1px solid #f8fafc;
        }
        .header-notif-item:last-child {
          border-bottom: none;
        }
        .header-notif-item:hover {
          background-color: #f8fafc;
        }

        .notif-type-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .header-notif-item:hover .notif-type-circle {
          transform: scale(1.05);
        }

        /* View All Link - NO UNDERLINE on hover */
        .view-all-link {
          color: #6366f1;
          font-weight: 700;
          font-size: 14px;
          transition: color 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
          display: inline-block;
          text-decoration: none !important;
          user-select: none;
        }
        .view-all-link:hover,
        .view-all-link:focus,
        .view-all-link:active {
          color: #4338ca !important;
          text-decoration: none !important;
          opacity: 0.9;
        }

        @media (max-width: 576px) {
          .header-notif-dropdown {
            position: fixed !important;
            top: 66px !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            max-width: 390px !important;
            margin: 0 auto !important;
            transform: none !important;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18) !important;
            z-index: 1060 !important;
          }
          .header-notif-item {
            padding: 12px 14px;
          }
        }
      `}</style>

      {/* Bell Toggle Icon with Clean Red Dot */}
      <Dropdown.Toggle
        as="div"
        className="header-bell-toggle d-flex align-items-center justify-content-center position-relative"
        style={{
          cursor: "pointer",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
        }}
        id="notification-dropdown-toggle"
      >
        <FaBell
          size={size}
          className="text-secondary"
          style={{ transition: "color 0.2s" }}
        />

        {/* Clean Red Dot  */}
        {unreadCount > 0 && (
          <span
            className="position-absolute bg-danger rounded-circle shadow-sm"
            style={{
              width: "9px",
              height: "9px",
              top: "5px",
              right: "6px",
              border: "2px solid #ffffff",
            }}
          />
        )}
      </Dropdown.Toggle>

      {/* Dropdown Popup Menu */}
      <Dropdown.Menu className="header-notif-dropdown shadow-lg">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white">
          <h6 className="fw-bolder mb-0 text-dark" style={{ fontSize: "16px", letterSpacing: "-0.3px" }}>
            Notifications
          </h6>
          {unreadCount > 0 ? (
            <span
              className="badge rounded-pill fw-bold px-3 py-1.5 text-white"
              style={{
                backgroundColor: "#6366f1",
                fontSize: "12px",
                letterSpacing: "0.2px",
              }}
            >
              {unreadCount} New
            </span>
          ) : (
            <span
              className="badge rounded-pill fw-semibold px-2.5 py-1 text-muted"
              style={{
                backgroundColor: "#f1f5f9",
                fontSize: "11px",
              }}
            >
              0 New
            </span>
          )}
        </div>

        {/* Body - Strictly Maximum 2 Items with Task/Project specific Logo */}
        <div>
          {previewList.length === 0 ? (
            <div className="text-center py-4 px-3">
              <div
                className="notif-type-circle mx-auto mb-2"
                style={{ backgroundColor: "#f1f5f9", color: "#94a3b8" }}
              >
                <FaBell size={16} />
              </div>
              <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>
                No notifications yet
              </div>
              <div className="text-muted small">
                Your database tasks and projects will appear here.
              </div>
            </div>
          ) : (
            previewList.map((notif) => {
              const iconConfig = getItemIconConfig(notif);
              return (
                <div
                  key={notif.id}
                  className="header-notif-item d-flex align-items-start gap-3"
                  onClick={() => handleItemClick(notif)}
                >
                  {/* Task or Project Specific Logo Circle */}
                  <div
                    className="notif-type-circle"
                    style={{
                      backgroundColor: iconConfig.bg,
                      color: iconConfig.color,
                    }}
                  >
                    {iconConfig.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1 min-w-0 pt-0.5">
                    <div
                      className="text-dark fw-medium text-truncate mb-1"
                      style={{ fontSize: "13.5px", lineHeight: "1.4" }}
                      title={notif.title}
                    >
                      {notif.title}
                    </div>
                    <div
                      className="text-secondary small"
                      style={{ fontSize: "11.5px", color: "#94a3b8" }}
                    >
                      {notif.formattedDateTime}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (Immediately closes dropdown and navigates to /notification) */}
        <div className="p-3 border-top bg-white text-center">
          <div
            className="view-all-link"
            onClick={handleViewAll}
          >
            View All Notifications
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBellDropdown;
