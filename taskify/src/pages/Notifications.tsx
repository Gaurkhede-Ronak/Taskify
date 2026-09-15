import React, { useState, forwardRef } from "react";
import { Card, Button, Spinner, Dropdown, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaBriefcase,
  FaExclamationCircle,
  FaClock,
  FaListUl,
  FaCheck,
  FaBellSlash,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaRegTrashAlt,
  FaLayerGroup,
  FaExclamationTriangle,
  FaEllipsisV,
  FaCheckDouble,
} from "react-icons/fa";
import { useNotifications, type NotificationItem } from "../hooks/useNotifications";

// Custom Dropdown Toggle for Three Dots Menu
const CustomToggle = forwardRef<HTMLButtonElement, { children?: React.ReactNode; onClick?: (e: React.MouseEvent) => void }>(
  ({ children, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
      className="btn btn-light btn-sm border-0 bg-transparent text-secondary p-1 d-flex align-items-center justify-content-center rounded-circle shadow-none"
      style={{ width: "32px", height: "32px" }}
    >
      {children}
    </button>
  )
);
CustomToggle.displayName = "CustomToggle";

const TABS: { id: "all" | "unread" | "tasks" | "projects" | "urgent"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <FaLayerGroup size={13} /> },
  { id: "unread", label: "Unread", icon: <FaCheck size={12} /> },
  { id: "tasks", label: "Tasks", icon: <FaListUl size={13} /> },
  { id: "projects", label: "Projects", icon: <FaBriefcase size={13} /> },
  { id: "urgent", label: "Urgent & Deadlines", icon: <FaExclamationTriangle size={13} /> },
];

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refresh,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "tasks" | "projects" | "urgent">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter based on active tab
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "tasks") return item.targetType === "task" || item.type === "task" || item.type === "completed";
    if (activeTab === "projects") return item.targetType === "project" || item.type === "project";
    if (activeTab === "urgent") return item.type === "urgent" || item.type === "deadline";
    return true;
  });

  const tasksCount = notifications.filter((n) => n.targetType === "task" || n.type === "task" || n.type === "completed").length;
  const projectsCount = notifications.filter((n) => n.targetType === "project" || n.type === "project").length;
  const urgentCount = notifications.filter((n) => n.type === "urgent" || n.type === "deadline").length;

  const getTabCount = (tabId: string) => {
    if (tabId === "all") return notifications.length;
    if (tabId === "unread") return unreadCount;
    if (tabId === "tasks") return tasksCount;
    if (tabId === "projects") return projectsCount;
    return urgentCount;
  };

  const renderIcon = (notification: NotificationItem) => {
    if (notification.targetType === "project") return <FaBriefcase size={16} />;
    switch (notification.type) {
      case "urgent": return <FaExclamationCircle size={16} />;
      case "deadline": return <FaClock size={16} />;
      case "completed": return <FaCheckCircle size={16} />;
      default: return <FaListUl size={16} />;
    }
  };

  const handleItemView = (notification: NotificationItem) => {
    dismissNotification(notification.id);
    if (notification.link) navigate(notification.link);
  };

  // Status info: Completed (#00594c), Urgent (#ef4444), Active (#2563eb)
  const getStatusInfo = (item: NotificationItem) => {
    if (item.type === "completed") return { text: "Completed", bg: "#00594c" };
    if (item.type === "urgent" || item.priorityBadge?.toLowerCase().includes("urgent")) {
      return { text: "Urgent", bg: "#ef4444" };
    }
    return { text: "Active", bg: "#2563eb" };
  };

  // Shared Action Buttons
  const renderActions = (item: NotificationItem) => (
    <div className="d-inline-flex align-items-center gap-2">
      <button type="button" className="view-btn-custom" onClick={() => handleItemView(item)}>
        {item.targetType === "project" ? "View Project" : "View Task"}
        <FaExternalLinkAlt size={10} />
      </button>

      <Dropdown align="end">
        <Dropdown.Toggle as={CustomToggle}><FaEllipsisV size={13} /></Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-custom">
          {!item.isRead && (
            <Dropdown.Item onClick={() => markAsRead(item.id)} className="d-flex align-items-center gap-2 text-dark">
              <FaCheck size={12} className="text-primary" /> Mark as Read
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={() => handleItemView(item)} className="d-flex align-items-center gap-2 text-dark">
            <FaExternalLinkAlt size={12} className="text-primary" /> View Details
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => dismissNotification(item.id)} className="d-flex align-items-center gap-2 text-danger">
            <FaRegTrashAlt size={12} /> Delete Notification
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );

  return (
    <div className="w-100 p-3 p-sm-4 p-xl-5" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div className="mx-auto" style={{ maxWidth: "1400px" }}>
        <style>{`
          /* Separate Tabs Bar (Matching Image 1 with generous spacing) */
          .notif-tabs-bar {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 14px;
            padding-bottom: 4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .notif-tabs-bar::-webkit-scrollbar { display: none; }
          .notif-tab-btn {
            border: 1px solid transparent;
            background: transparent;
            color: #64748b;
            font-weight: 600;
            font-size: 13.5px;
            padding: 9px 18px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            transition: all 0.18s;
            cursor: pointer;
            user-select: none;
            flex-shrink: 0;
          }
          .notif-tab-btn:hover:not(.active) { color: #4338ca; background: #eef2ff; }
          .notif-tab-btn.active {
            background: #4f46e5 !important;
            color: #fff !important;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.28);
          }
          .notif-tab-btn.active svg { color: #fff !important; }
          .tab-count-badge { border-radius: 50rem; padding: 2px 8px; font-size: 11px; font-weight: 700; }

          /* Table Container */
          .notif-table-card {
            border-radius: 20px;
            border: 1px solid #f1f5f9;
            background: #fff;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
            overflow: hidden;
          }
          .notif-table thead th {
            background: #fff;
            color: #64748b;
            font-size: 11.5px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            padding: 18px 24px;
            border-bottom: 1px solid #f1f5f9;
          }
          .notif-table tbody td {
            padding: 18px 24px;
            border-bottom: 1px solid #f8fafc;
            vertical-align: middle;
            background: #fff;
          }
          .notif-table tbody tr:hover td { background: #f8fafc; }
          .notif-icon-box {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .date-badge-box {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 5px 12px;
            font-size: 12.5px;
            font-weight: 500;
            color: #334155;
            background: #fff;
            white-space: nowrap;
          }
          .priority-badge-pill {
            background: #f1f5f9;
            color: #64748b;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 9px;
            border-radius: 50rem;
          }
          .status-pill-badge {
            border-radius: 50rem;
            padding: 5px 14px;
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
          }
          .view-btn-custom {
            background: #fff;
            border: 1px solid #e2e8f0;
            color: #4f46e5;
            font-size: 12px;
            font-weight: 600;
            padding: 5px 14px;
            border-radius: 50rem;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none !important;
            cursor: pointer;
            white-space: nowrap;
          }
          .view-btn-custom:hover { background: #f8fafc; border-color: #cbd5e1; color: #4338ca; }
          .dropdown-menu-custom {
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            padding: 6px;
          }
          .dropdown-menu-custom .dropdown-item { border-radius: 8px; font-size: 13px; font-weight: 500; padding: 8px 12px; }

          /* Mobile Cards (Image 2 with clean spacing & no extra elements) */
          .notif-mobile-card {
            background: #fff;
            border: 1px solid #eef2f6;
            border-radius: 16px;
            padding: 16px 18px;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
          }
          .notif-mobile-card.unread {
            background: #fafbfe;
            border-color: #e0e7ff;
            box-shadow: 0 3px 12px rgba(79, 70, 229, 0.06);
          }
          @media (max-width: 767.98px) { .notif-table-card { border-radius: 16px; } }
        `}</style>

        {/* ================= 1. HEADER SECTION ================= */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h2 className="fw-bolder text-dark mb-0" style={{ letterSpacing: "-0.5px", fontSize: "24px" }}>
                Notifications
              </h2>
              {unreadCount > 0 ? (
                <span className="badge rounded-pill fw-semibold px-2.5 py-1" style={{ backgroundColor: "#fee2e2", color: "#ef4444", fontSize: "11.5px" }}>
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="badge rounded-pill fw-semibold px-2.5 py-1" style={{ backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: "11.5px" }}>
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-secondary mb-0" style={{ fontSize: "13px" }}>
              Real-time activity alerts and deadline updates from your database.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-start justify-content-sm-end flex-wrap">
            {unreadCount > 0 && (
              <Button
                variant="light"
                size="sm"
                className="rounded-pill shadow-sm border border-light-subtle d-inline-flex align-items-center justify-content-center gap-2 px-3 py-1.5 fw-semibold flex-grow-1 flex-sm-grow-0"
                style={{ backgroundColor: "#ffffff", fontSize: "12.5px", color: "#4f46e5" }}
                onClick={markAllAsRead}
              >
                <FaCheckDouble size={11} color="#4f46e5" />
                Mark all read
              </Button>
            )}

            <Button
              variant="light"
              size="sm"
              className="rounded-pill shadow-sm border border-light-subtle d-inline-flex align-items-center justify-content-center gap-2 px-3 py-1.5 fw-semibold flex-grow-1 flex-sm-grow-0"
              style={{ backgroundColor: "#ffffff", fontSize: "12.5px", color: "#334155" }}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FaSyncAlt size={11} className={isRefreshing ? "fa-spin text-primary" : ""} />
              Refresh
            </Button>

            {notifications.length > 0 && (
              <Button
                variant="light"
                size="sm"
                className="rounded-pill shadow-sm border border-light-subtle d-inline-flex align-items-center justify-content-center gap-2 px-3 py-1.5 fw-semibold flex-grow-1 flex-sm-grow-0"
                style={{ backgroundColor: "#ffffff", fontSize: "12.5px", color: "#ef4444" }}
                onClick={clearAllNotifications}
              >
                <FaRegTrashAlt size={11} color="#ef4444" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* ================= 2. SEPARATE TABS BAR (Image 1 Style) ================= */}
        <div className="notif-tabs-bar mb-3 mb-md-4">
          {TABS.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`notif-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
                {(tab.id !== "unread" || count > 0) && (
                  <span
                    className="tab-count-badge"
                    style={{
                      backgroundColor: isActive ? "#ffffff" : tab.id === "unread" ? "#fee2e2" : tab.id === "urgent" ? "#fef3c7" : "#e2e8f0",
                      color: isActive ? "#4f46e5" : tab.id === "unread" ? "#ef4444" : tab.id === "urgent" ? "#d97706" : "#475569",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. CONTENT  */}
        <Card className="notif-table-card border-0">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
              <p className="text-secondary mt-3 fw-medium" style={{ fontSize: "14px" }}>
                Loading notifications from database...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div className="d-flex justify-content-center mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "70px", height: "70px", backgroundColor: "#f1f5f9" }}>
                  <FaBellSlash size={28} color="#94a3b8" />
                </div>
              </div>
              <h6 className="fw-bolder text-dark mb-1" style={{ fontSize: "16px" }}>
                {activeTab === "all" ? "No notifications found" : `No ${activeTab} notifications`}
              </h6>
              <p className="text-secondary small mb-4" style={{ maxWidth: "450px", margin: "0 auto" }}>
                {activeTab === "all"
                  ? "There are currently no notifications in your database. Once tasks and projects are created or assigned, they will appear here."
                  : `You do not have any notifications matching the "${activeTab}" filter.`}
              </p>
              {activeTab === "all" && (
                <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <Button variant="primary" className="rounded-pill px-4 py-2 fw-semibold shadow-sm" style={{ fontSize: "13px" }} onClick={() => navigate("/tasks")}>
                    + Go to Tasks
                  </Button>
                  <Button variant="outline-primary" className="rounded-pill px-4 py-2 fw-semibold" style={{ fontSize: "13px" }} onClick={() => navigate("/projects")}>
                    + Go to Projects
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Laptop & Tablet Table Layout (Image 1 Style, Visible on >= 768px) */}
              <div className="table-responsive d-none d-md-block">
                <Table hover className="notif-table align-middle">
                  <thead>
                    <tr>
                      <th style={{ minWidth: "260px" }}>Notification</th>
                      <th style={{ minWidth: "110px" }}>Category</th>
                      <th style={{ minWidth: "120px" }}>Status</th>
                      <th style={{ minWidth: "120px" }}>Date & Time</th>
                      <th style={{ width: "130px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.map((notification) => {
                      const status = getStatusInfo(notification);
                      const isProject = notification.targetType === "project" || notification.type === "project";

                      return (
                        <tr key={notification.id}>
                          {/* 1. Notification */}
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="notif-icon-box" style={{ backgroundColor: notification.iconBg, color: notification.iconColor }}>
                                {renderIcon(notification)}
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-1" style={{ fontSize: "14px", letterSpacing: "-0.2px" }}>
                                  {notification.title}
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  {notification.priorityBadge && (
                                    <span className="priority-badge-pill">{notification.priorityBadge}</span>
                                  )}
                                  {notification.message && (
                                    <span className="text-secondary small" style={{ fontSize: "12.5px" }}>{notification.message}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Category (Clean TASK or PROJECT) */}
                          <td>
                            <span
                              className="badge rounded-pill fw-bold text-uppercase"
                              style={{
                                backgroundColor: isProject ? "#2563eb" : "#4f46e5",
                                color: "#ffffff",
                                fontSize: "10px",
                                padding: "4px 10px",
                                letterSpacing: "0.3px",
                              }}
                            >
                              {isProject ? "PROJECT" : "TASK"}
                            </span>
                          </td>

                          {/* 3. Status */}
                          <td>
                            <span className="status-pill-badge" style={{ backgroundColor: status.bg }}>
                              {status.text}
                            </span>
                          </td>

                          {/* 4. Date & Time */}
                          <td>
                            <div className="date-badge-box">{notification.timeAgo}</div>
                          </td>

                          {/* 5. Actions */}
                          <td style={{ textAlign: "right" }}>{renderActions(notification)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Cards Layout (Image 2 Style with Perfect Spacing & No Extra Duplicate Badges, < 768px) */}
              <div className="d-md-none d-flex flex-column gap-3 p-3">
                {filteredNotifications.map((notification) => {
                  const status = getStatusInfo(notification);
                  // Remove extra/redundant priority badge if it repeats status
                  const showPriority = notification.priorityBadge &&
                    notification.priorityBadge.toLowerCase() !== status.text.toLowerCase();

                  return (
                    <div
                      key={notification.id}
                      className={`notif-mobile-card ${!notification.isRead ? "unread" : ""}`}
                    >
                      {/* Top Row: Icon + Single Clean Status + Menu */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap min-w-0">
                          <div
                            className="notif-icon-box"
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              backgroundColor: notification.iconBg,
                              color: notification.iconColor,
                              fontSize: "15px",
                            }}
                          >
                            {renderIcon(notification)}
                          </div>

                          {/* Clean Status Pill (No duplicate URGENT/Urgent or COMPLETED/Completed) */}
                          <span className="status-pill-badge" style={{ backgroundColor: status.bg, padding: "4px 11px", fontSize: "11px" }}>
                            {status.text}
                          </span>

                          {showPriority && (
                            <span className="priority-badge-pill" style={{ fontSize: "10.5px", padding: "2px 8px" }}>
                              {notification.priorityBadge}
                            </span>
                          )}
                        </div>

                        {/* Right: Unread Indicator Dot + ⋮ Action Dropdown */}
                        <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                          {!notification.isRead && (
                            <span
                              className="rounded-circle"
                              style={{ width: "8px", height: "8px", backgroundColor: "#4f46e5", display: "inline-block" }}
                              title="Unread"
                            />
                          )}
                          <Dropdown align="end">
                            <Dropdown.Toggle as={CustomToggle}><FaEllipsisV size={13} /></Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-custom">
                              {!notification.isRead && (
                                <Dropdown.Item onClick={() => markAsRead(notification.id)} className="d-flex align-items-center gap-2 text-dark">
                                  <FaCheck size={12} className="text-primary" /> Mark as Read
                                </Dropdown.Item>
                              )}
                              <Dropdown.Item onClick={() => handleItemView(notification)} className="d-flex align-items-center gap-2 text-dark">
                                <FaExternalLinkAlt size={12} className="text-primary" /> View Details
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => dismissNotification(notification.id)} className="d-flex align-items-center gap-2 text-danger">
                                <FaRegTrashAlt size={12} /> Delete Notification
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>

                      {/* Middle: Title & Message with Clean Spacing */}
                      <div className="my-2">
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: "14.5px", lineHeight: "1.35", letterSpacing: "-0.2px" }}>
                          {notification.title}
                        </div>
                        {notification.message && (
                          <p className="text-secondary mb-0" style={{ fontSize: "12.5px", lineHeight: "1.4" }}>
                            {notification.message}
                          </p>
                        )}
                      </div>

                      {/* Bottom Row: Date Box & Direct Action Button */}
                      <div className="d-flex align-items-center justify-content-between pt-2.5 mt-2 border-top border-light-subtle flex-wrap gap-2">
                        <div className="date-badge-box" style={{ fontSize: "12px", padding: "4px 10px" }}>
                          {notification.timeAgo}
                        </div>

                        <button
                          type="button"
                          className="view-btn-custom ms-auto"
                          onClick={() => handleItemView(notification)}
                        >
                          {notification.targetType === "project" ? "View Project" : "View Task"}
                          <FaExternalLinkAlt size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Notifications;