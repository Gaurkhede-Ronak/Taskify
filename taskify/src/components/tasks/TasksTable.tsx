import React, { forwardRef } from "react";
import { Dropdown } from "react-bootstrap";
import { FiBriefcase, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import type { Task } from "../../redux/tasks/taskSlice";

interface TasksTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string, taskName: string) => void;
}

interface CustomToggleProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const CustomToggle = forwardRef<HTMLButtonElement, CustomToggleProps>(({ children, onClick }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Task actions"
    onClick={(event) => {
      event.preventDefault();
      onClick?.(event);
    }}
    className="btn btn-light btn-sm border-0 bg-transparent text-secondary p-2 d-flex align-items-center justify-content-center rounded-circle"
  >
    {children}
  </button>
));

CustomToggle.displayName = "CustomToggle";

export const TasksTable: React.FC<TasksTableProps> = ({ tasks, onEdit, onDelete }) => {
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-success text-white";
    if (s === "in-progress") return "bg-primary text-white";
    return "bg-warning text-dark";
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "bg-danger-subtle text-danger border border-danger-subtle";
    if (p === "medium") return "bg-warning-subtle text-warning border border-warning-subtle";
    return "bg-success-subtle text-success border border-success-subtle";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "No date";
    return parsedDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const truncateId = (value?: string) => {
    if (!value) return "—";
    return value.length > 12 ? `${value.slice(0, 12)}...` : value;
  };

  const getTaskIcon = () => (
    <div className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0" style={{ width: "46px", height: "46px", backgroundColor: "#f59e0b" }}>
      <FiBriefcase size={20} />
    </div>
  );

  return (
    <>
      <div className="d-none d-md-flex row g-0 align-items-center px-3 px-md-4 py-3 border-bottom text-secondary fw-bold text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.8px", backgroundColor: "#fbfdff" }}>
        <div className="col-md-4">Task</div>
        <div className="col-md-2">Assigned To</div>
        <div className="col-md-2">Status</div>
        <div className="col-md-2">Due Date</div>
        <div className="col-md-2 text-end">Actions</div>
      </div>

      {tasks.map((task, taskIndex) => (
        <div
          key={task._id}
          className={`row g-0 align-items-center py-3 px-3 px-md-4${taskIndex < tasks.length - 1 ? " border-bottom" : ""}`}
          style={{ minHeight: "84px" }}
        >
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-between mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-3 min-w-0">
              {getTaskIcon()}
              <div className="min-w-0">
                <span className="fw-bold text-dark text-truncate d-block mb-1" style={{ maxWidth: "220px", fontSize: "14px" }}>
                  {task.taskName || "Untitled Task"}
                </span>
                <span className={`badge text-capitalize small fw-medium ${getPriorityBadge(task.priority || "medium")}`}>
                  {task.priority || "medium"} Priority
                </span>
              </div>
            </div>
            <div className="d-md-none">
              <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                <Dropdown.Toggle as={CustomToggle}>
                  <FiMoreVertical size={20} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg border-0 rounded-3 mt-1">
                  <Dropdown.Item onClick={() => onEdit?.(task)} className="d-flex align-items-center gap-2 py-2 small fw-medium">
                    <FiEdit2 size={16} /> Edit Task
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => onDelete?.(task._id, task.taskName || "this task")} className="d-flex align-items-center gap-2 py-2 small fw-medium text-danger">
                    <FiTrash2 size={16} /> Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          <div className="col-12 col-md-2 mb-3 mb-md-0">
            <span className="d-block d-md-none text-uppercase text-secondary fw-bold mb-2" style={{ fontSize: "10px", letterSpacing: "0.7px" }}>
              Assigned To
            </span>
            {task.assignedTo ? (
              <span className="badge text-secondary border fw-medium" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                {truncateId(task.assignedTo)}
              </span>
            ) : (
              <span className="text-muted small fst-italic">Unassigned</span>
            )}
          </div>

          <div className="col-6 col-md-2 mb-3 mb-md-0">
            <span className="d-block d-md-none text-uppercase text-secondary fw-bold mb-2" style={{ fontSize: "10px", letterSpacing: "0.7px" }}>
              Status
            </span>
            <span className={`badge ${getStatusBadge(task.status)} rounded-pill fw-medium px-3 py-1 text-capitalize shadow-sm`}>
              {task.status || "todo"}
            </span>
          </div>

          <div className="col-6 col-md-2 text-end text-md-start mb-3 mb-md-0">
            <span className="d-block d-md-none text-uppercase text-secondary fw-bold mb-2" style={{ fontSize: "10px", letterSpacing: "0.7px" }}>
              Due Date
            </span>
            <span className="text-dark small fw-semibold px-2 py-1 rounded-2 border" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className="d-none d-md-flex col-md-2 justify-content-end">
            <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
              <Dropdown.Toggle as={CustomToggle}>
                <FiMoreVertical size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="border-0 mt-1"
                style={{
                  minWidth: 180,
                  borderRadius: 18,
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.15)",
                  padding: "0.45rem",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  zIndex: 1050,
                }}
              >
                <Dropdown.Item
                  onClick={() => onEdit?.(task)}
                  className="d-flex align-items-center gap-2 py-2 small fw-medium"
                  style={{ borderRadius: 12, padding: "0.7rem 0.9rem", fontSize: 15, fontWeight: 600 }}
                >
                  <FiEdit2 size={16} /> Edit Task
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => onDelete?.(task._id, task.taskName || "this task")}
                  className="d-flex align-items-center gap-2 py-2 small fw-medium text-danger"
                  style={{ borderRadius: 12, padding: "0.7rem 0.9rem", fontSize: 15, fontWeight: 600 }}
                >
                  <FiTrash2 size={16} /> Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      ))}
    </>
  );
};

export default TasksTable;