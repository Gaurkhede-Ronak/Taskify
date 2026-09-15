import React, { forwardRef } from "react";
import { Button, Form, Modal, Dropdown, Spinner } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  FiBriefcase,
  FiDatabase,
  FiEdit2,
  FiFolder,
  FiGlobe,
  FiMoreVertical,
  FiPenTool,
  FiSmartphone,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";

// --- Empty State Config ---
interface EmptyStateConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

// --- Component Table Props ---
interface ComponentTableProps {
  type: "project" | "task";
  data: any[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  createLabel?: string;
  onCreate?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string, name: string) => void;
  onView?: (item: any) => void;
  assignedToOptions?: { value: string; label: string }[];
  currentUserId?: string;
  showToolbar?: boolean;
  maxWidth?: number;
  emptyState?: EmptyStateConfig;
}

// --- Delete Modal Props ---
interface DeleteConfirmationModalProps {
  show: boolean;
  title?: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}


/* 1. Delete Confirmation Modal
*/
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show, title = "Delete item?", itemName = "this item", onClose, onConfirm, confirmLabel = "Delete", cancelLabel = "Cancel", loading = false,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton style={{ border: "none", padding: "30px 30px 0 30px" }}>
        <Modal.Title style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937", margin: 0 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "24px 30px 0 30px" }}>
        <div style={{ fontSize: "17px", color: "#64748b" }}>
          This will permanently delete <strong style={{ color: "#ef4444", fontWeight: 700 }}>{itemName}</strong>.
        </div>
      </Modal.Body>
      <Modal.Footer style={{ border: "none", padding: "34px 30px 30px 30px" }}>
        <Button variant="light" onClick={onClose} style={{ borderRadius: "10px", backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: 600, padding: "10px 24px" }}>{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading} style={{ borderRadius: "10px", backgroundColor: "#ef4444", fontWeight: 600, padding: "10px 24px" }}>{loading ? "Deleting..." : confirmLabel}</Button>
      </Modal.Footer>
    </Modal>
  );
};

/*
2. Custom Dropdown Toggle (Hide Arrow)
*/
const CustomToggle = forwardRef<HTMLButtonElement, { children?: React.ReactNode; onClick?: (e: React.MouseEvent) => void }>(
  ({ children, onClick }, ref) => (
    <button ref={ref} type="button" onClick={(e) => { e.preventDefault(); onClick?.(e); }} className="btn btn-light btn-sm border-0 bg-transparent text-secondary p-2 d-flex align-items-center justify-content-center rounded-circle shadow-none">
      {children}
    </button>
  )
);
CustomToggle.displayName = "CustomToggle";

/* 3. Component Table (Unified Project & Task)
*/ 
export const ComponentTable: React.FC<ComponentTableProps> = ({
  type, data = [], loading = false, searchValue = "", onSearchChange, searchPlaceholder = "Search...", createLabel = "Create New", onCreate, onEdit, onDelete, onView, assignedToOptions = [], currentUserId, showToolbar = true, maxWidth = 1280, emptyState,
}) => {

  const isProject = type === "project";

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-success text-white";
    if (s === "active" || s === "in-progress") return "bg-primary text-white";
    return "bg-warning text-dark";
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "bg-danger bg-opacity-10 text-danger";
    if (p === "low") return "bg-success bg-opacity-10 text-success";
    return "bg-secondary bg-opacity-10 text-secondary";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "No date";
    return parsedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getIconColor = (name: string) => {
    const colors = ["#2563eb", "#0f766e", "#d97706", "#dc2626", "#8b5cf6", "#db2777"];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  const getProjectIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("web") || lowerName.includes("site")) return <FiGlobe size={22} />;
    if (lowerName.includes("app") || lowerName.includes("mobile")) return <FiSmartphone size={22} />;
    if (lowerName.includes("design") || lowerName.includes("ui")) return <FiPenTool size={22} />;
    if (lowerName.includes("market") || lowerName.includes("seo")) return <FiTrendingUp size={22} />;
    if (lowerName.includes("data") || lowerName.includes("api")) return <FiDatabase size={22} />;
    return <FiFolder size={22} />;
  };

  const isEmpty = !loading && data.length === 0;

  return (
    <div style={{ maxWidth, margin: "0 auto" }}>
      
      {/*  CSS for Perfect Mobile and Desktop Harmony */}
      <style>{`
        .ct-table-row {
          display: flex;
          transition: all 0.2s ease;
        }
        .ct-col-detail { display: flex; align-items: center; gap: 12px; }
        .ct-mobile-bottom { min-width: 0; }
        .ct-search-wrap { min-width: 0; }
        
        @media (max-width: 767.98px) {
          .ct-toolbar { flex-direction: row !important; align-items: center !important; margin-bottom: 1rem !important; }
          .ct-search-wrap { flex: 1 1 auto; width: auto !important; }
          .ct-search-input { width: 100%; padding-left: 2.35rem !important; font-size: 14px !important; cursor: text; }
          .ct-toolbar .ct-create-button { flex: 0 1 auto; width: auto; min-width: 0; padding: 0 0.75rem !important; font-size: 12px !important; }
          .ct-table-shell { background: transparent !important; border: 0 !important; box-shadow: none !important; }
          .ct-table-row { flex-direction: column; align-items: stretch; padding: 1rem !important; margin-bottom: 0.75rem; border: 1px solid #e8edf3 !important; border-radius: 14px !important; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06); }
          .ct-table-row:last-child { margin-bottom: 0; }
          .ct-col-detail { width: 100%; justify-content: space-between; margin-bottom: 1rem; }
          .ct-col-detail > div:first-child { min-width: 0; }
          .ct-col-members, .ct-col-status, .ct-col-date, .ct-col-progress {
            width: 100%;
            min-width: 0;
          }
          .ct-mobile-bottom {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            align-items: center;
            gap: 0.75rem;
          }
          .ct-col-members { grid-column: 1 / -1; }
          .ct-col-progress { grid-column: 1 / -1; }
          .ct-col-date span { display: block; width: 100%; text-align: center; }
          .ct-col-status .badge { max-width: 100%; }
          .ct-desktop-actions { display: none !important; }
        }
        
        @media (min-width: 768px) {
          .ct-table-row { flex-direction: row; align-items: center; }
          .ct-col-detail { flex: 0 0 35%; padding-right: 16px; }
          .ct-col-detail:not(.is-project) { flex-basis: 32%; }
          .ct-col-detail.is-project { flex-basis: 30%; }
          .ct-mobile-bottom { display: contents; }
          .ct-col-members { display: block; flex: 0 0 25%; min-width: 0; }
          .ct-col-members:not(.is-project) { flex-basis: 23%; }
          .ct-col-members.is-project { flex-basis: 20%; }
          .ct-col-status { flex: 0 0 15%; min-width: 0; }
          .ct-col-date { flex: 0 0 20%; min-width: 0; }
          .ct-col-date.is-project { flex-basis: 15%; }
          .ct-col-progress { display: block; flex: 0 0 15%; min-width: 0; padding-right: 16px; }
          .ct-desktop-actions { display: flex; flex: 0 0 10%; justify-content: flex-end; margin-left: auto; }
          .ct-desktop-actions.is-project { flex-basis: 5%; }
          .ct-mobile-actions { display: none !important; }
        }
      `}</style>

      {/* 1. Top Toolbar (Search & Button - Fixed for Mobile) */}
      {showToolbar && (
        <div className="ct-toolbar d-flex flex-row flex-nowrap align-items-center justify-content-between gap-2 gap-md-3 w-100 mb-4">
          <div className="ct-search-wrap position-relative w-100 flex-grow-1">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 ms-md-4 text-secondary" size={14} />
            <Form.Control
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="ct-search-input shadow-sm w-100"
              style={{ paddingLeft: "2.5rem", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "50px", height: "46px", color: "#0f172a", fontSize: "14.5px", fontWeight: 500 }}
            />
          </div>
          {onCreate && (
            <Button 
              onClick={onCreate} 
              className="ct-create-button border-0 d-flex flex-nowrap align-items-center justify-content-center gap-2 shadow-sm flex-shrink-0" 
              style={{ backgroundColor: "#2563eb", color: "#ffffff", fontSize: "14.5px", fontWeight: "600", borderRadius: "50px", height: "46px", padding: "0 1.25rem", whiteSpace: "nowrap" }}
            >
              <FaPlus size={13} />
              <span>{createLabel}</span>
            </Button>
          )}
        </div>
      )}

      {/* 2. Loading State */}
      {loading && data.length === 0 ? (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" style={{ color: "#2563eb" }} /></div>
      ) : isEmpty && emptyState ? (
        /* 3. Empty State */
        <div className="text-center bg-white shadow-sm border border-light-subtle py-5" style={{ borderRadius: "16px", minHeight: "240px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle" style={{ width: "64px", height: "64px", backgroundColor: emptyState.iconBg || "#eff6ff", color: emptyState.iconColor || "#2563eb" }}>
            {emptyState.icon}
          </div>
          <h5 className="fw-bold text-dark">{emptyState.title}</h5>
          <p className="text-secondary small mb-0">{emptyState.description}</p>
        </div>
      ) : (
        /* 4. Table UI */
        <div className="ct-table-shell bg-white shadow-sm border border-light-subtle" style={{ borderRadius: "16px", overflow: "visible" }}>
          
          {/* Desktop Table Header */}
          <div className="d-none d-md-flex align-items-center px-4 py-3 border-bottom bg-white text-secondary fw-bolder text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.5px", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
            <div style={{ width: isProject ? "30%" : "32%" }}>{isProject ? "Project" : "Task"}</div>
            <div style={{ width: isProject ? "20%" : "23%" }}>{isProject ? "Members" : "Assigned To"}</div>
            <div style={{ width: "15%" }}>Status</div>
            <div style={{ width: isProject ? "15%" : "20%" }}>Due Date</div>
            {isProject && <div style={{ width: "15%" }}>Progress</div>}
            <div style={{ width: isProject ? "5%" : "10%" }} className="text-end ms-auto">Actions</div>
          </div>

          {/* Table Rows */}
          {data.map((item, index) => {
            const itemId = item._id;
            const itemName = isProject ? item.projectName : item.taskName;
            const canManage = isProject ? Boolean(currentUserId && item.owner && String(item.owner) === currentUserId) : true;
            const apiMemberArray: string[] = Array.isArray(item.members)
              ? item.members.flat(Infinity).map((member: unknown) => String(member).trim()).filter(Boolean)
              : [];
            let customMemberArray: string[] = [];
            if (isProject) {
              try {
                const savedMembers = JSON.parse(localStorage.getItem(`taskify:project-members:${itemId}`) || "[]");
                customMemberArray = Array.isArray(savedMembers) ? savedMembers.filter((member): member is string => typeof member === "string" && Boolean(member.trim())) : [];
              } catch {
                customMemberArray = [];
              }
            }
            const memberArray = [...new Set([...apiMemberArray, ...customMemberArray])];
            const assignedUserName = assignedToOptions.find((user) => user.value === item.assignedTo)?.label || item.assignedTo;
            const progress = isProject ? (item.status === 'completed' ? 100 : item.status === 'active' ? 50 : 10) : 0;
            const iconColor = isProject ? getIconColor(itemName) : "#f59e0b"; // Orange For Task
            const isLast = index === data.length - 1;

            const ActionDropdown = () => (
              <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
                <Dropdown.Toggle as={CustomToggle}><FiMoreVertical size={20} /></Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg border border-light-subtle rounded-4 p-2 mt-2" style={{ minWidth: "150px", zIndex: 1050 }}>
                  <Dropdown.Item disabled={!canManage} onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="d-flex align-items-center gap-3 py-2 fw-semibold rounded-3 text-dark" style={{ fontSize: "14.5px" }}>
                    <FiEdit2 size={16} className="text-secondary" /> Edit {isProject ? "Project" : "Task"}
                  </Dropdown.Item>
                  <Dropdown.Divider className="my-1 border-light" />
                  <Dropdown.Item disabled={!canManage} onClick={(e) => { e.stopPropagation(); onDelete?.(itemId, itemName); }} className="d-flex align-items-center gap-3 py-2 fw-semibold rounded-3 text-danger" style={{ fontSize: "14.5px" }}>
                    <FiTrash2 size={16} /> Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            );

            return (
              <div 
                key={itemId} 
                className="ct-table-row px-4 py-3 bg-white" 
                style={{ 
                  cursor: onView ? "pointer" : "default",
                  borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                  borderBottomLeftRadius: isLast ? "16px" : "0",
                  borderBottomRightRadius: isLast ? "16px" : "0"
                }} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} 
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                onClick={() => { if (onView) onView(item); }}
              >
                {/* 1. Detail Column (Icon, Title, Priority) */}
                <div className={`ct-col-detail ${isProject ? "is-project" : ""}`}>
                  <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                    <div className="d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0" style={{ width: "48px", height: "48px", backgroundColor: iconColor, borderRadius: "12px" }}>
                      {isProject ? getProjectIcon(itemName) : <FiBriefcase size={22} />}
                    </div>
                    <div className="d-flex flex-column min-w-0">
                      <span className="fw-bolder text-dark text-truncate mb-1" style={{ fontSize: "16px" }}>{itemName || "Untitled"}</span>
                      <span className={`badge rounded-pill fw-semibold border ${getPriorityBadge(item.priority)}`} style={{ width: "max-content", fontSize: "11px", padding: "4px 10px" }}>
                        {item.priority ? `${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority` : "Medium Priority"}
                      </span>
                    </div>
                  </div>
                  {/* Mobile Actions Dropdown */}
                  <div className="ct-mobile-actions flex-shrink-0">
                     <ActionDropdown />
                  </div>
                </div>

                {/* 2. Meta Elements (Bottom row on mobile, Next columns on Desktop) */}
                <div className="ct-mobile-bottom">
                 
{/* Members / Assigned To */}
<div className={`ct-col-members ${isProject ? "is-project" : ""}`}>
  {isProject ? (
    memberArray.length > 0 ? (
      <div className="d-flex flex-wrap gap-2">
        {memberArray.slice(0, 2).map((m: string, i: number) => (
          <span
            key={i}
            className="text-secondary border fw-medium rounded px-2 py-1 bg-white"
            style={{ fontSize: "12px", borderColor: "#e2e8f0" }}
          >
            {m}
          </span>
        ))}

        {memberArray.length > 2 && (
          <span
            className="text-secondary border fw-medium rounded px-2 py-1 bg-white"
            style={{ fontSize: "12px", borderColor: "#e2e8f0" }}
          >
            +{memberArray.length - 2}
          </span>
        )}
      </div>
    ) : (
      <span className="text-muted small">None</span>
    )
  ) : (
    <span
      className="text-secondary"
      style={{ fontStyle: "italic", fontSize: "14px" }}
    >
      {assignedUserName || "Unassigned"}
    </span>
  )}
</div>
               {/* Status */}
                   <div className="ct-col-status">
                     <span className={`badge rounded-pill px-3 py-2 fw-bold text-capitalize shadow-sm ${getStatusBadge(item.status)}`} style={{ fontSize: "12px", backgroundColor: item.status === 'active' || item.status === 'in-progress' ? '#2563eb' : undefined }}>
                       {item.status || "Planning"}
                     </span>
                   </div>

                   {/* Due Date */}
                   <div className={`ct-col-date ${isProject ? "is-project" : ""}`}>
                     <span className="text-dark fw-semibold px-3 py-2 rounded-3 border bg-white" style={{ fontSize: "13.5px", borderColor: "#e2e8f0" }}>
                       {formatDate(item.dueDate)}
                     </span>
                   </div>

                   {/* Progress (Project Only) */}
                   {isProject && (
                     <div className="ct-col-progress">
                       <div className="d-flex justify-content-between mb-1">
                         <span className="text-secondary fw-semibold" style={{ fontSize: "11px" }}>Progress</span>
                         <span className="fw-bold text-dark" style={{ fontSize: "12px" }}>{progress}%</span>
                       </div>
                       <div className="progress rounded-pill" style={{ height: "6px", backgroundColor: "#e2e8f0" }}>
                         <div className="progress-bar rounded-pill" style={{ width: `${progress}%`, backgroundColor: "#0f766e" }} />
                       </div>
                     </div>
                   )}

                   {/* Desktop Actions Dropdown */}
                   <div className={`ct-desktop-actions ${isProject ? "is-project" : ""}`}>
                      <ActionDropdown />
                   </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};