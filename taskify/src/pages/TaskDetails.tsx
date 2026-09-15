import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getTasks } from "../redux/tasks/taskSlice";
import axiosInstance from "../api/axois";
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiBriefcase, 
  FiCheckSquare, 
  FiFolder,
  FiUser
} from "react-icons/fi";

interface UserOption {
  _id: string;
  name: string;
}

export const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      dispatch(getTasks());
    }
  }, [dispatch, tasks]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axiosInstance.get("/auth/getAllUsers");
        const responseData = response.data as { data?: UserOption[] };
        setUsers(Array.isArray(responseData.data) ? responseData.data : []);
      } catch {
        setUsers([]);
      }
    };
    void loadUsers();
  }, []);

  const task = tasks?.find((t: any) => t._id === id || t.id === id);

  // Find related project name if available
  const relatedProject = projects?.find((p: any) => p._id === task?.project || (p._id as any) === (task?.project as any));

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "completed") return { bg: "#dcfce7", color: "#15803d", text: "Completed" };
    if (s === "active" || s === "in-progress") return { bg: "#eff6ff", color: "#2563eb", text: "In Progress" };
    return { bg: "#fef9c3", color: "#a16207", text: "To Do" };
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === "high") return { bg: "#fee2e2", color: "#dc2626", text: "High" };
    if (p === "low") return { bg: "#dcfce7", color: "#16a34a", text: "Low" };
    return { bg: "#f1f5f9", color: "#64748b", text: "Medium" };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "May 22, 2024";
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) return "May 22, 2024";
    return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!task && !loading) {
    return (
      <Container fluid className="p-5 text-center" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <h4 className="fw-bold text-dark mb-3">Task not found</h4>
        <Button onClick={() => navigate(-1)} className="rounded-pill px-4" style={{ backgroundColor: "#2563eb", border: "none" }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const statusInfo = getStatusBadge(task?.status || "in-progress");
  const priorityInfo = getPriorityBadge(task?.priority || "high");
  const assignedUser = users.find((user) => user._id === task?.assignedTo);

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4 py-3 py-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "1280px" }}>
        <Button
          variant="white"
          onClick={() => navigate(-1)}
          className="d-inline-flex align-items-center gap-2 shadow-sm rounded-pill fw-semibold text-dark border mb-3"
          style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", padding: "8px 20px", fontSize: "14px" }}
        >
          <FiArrowLeft size={16} /> Tasks Details
        </Button>

        <div className="bg-white border rounded-4 shadow-sm p-3 p-md-5 mb-4" style={{ borderColor: "#e2e8f0" }}>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3 text-white flex-shrink-0" style={{ width: "52px", height: "52px", backgroundColor: "#f59e0b" }}>
              <FiCheckSquare size={24} />
            </div>
            <div className="min-w-0 flex-grow-1">
              <h2 className="mb-1 fw-bold text-dark text-truncate" style={{ fontSize: "1.5rem", letterSpacing: "-0.3px" }}>{task?.taskName || "Task Details"}</h2>
              <div className="d-flex flex-wrap gap-2">
                <Badge className="rounded-pill px-3 py-1 border-0 fw-semibold" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontSize: "0.68rem", lineHeight: 1.2 }}>{statusInfo.text}</Badge>
                <Badge className="rounded-pill px-3 py-1 border-0 fw-semibold" style={{ backgroundColor: "#2563eb", color: "#ffffff", fontSize: "0.68rem", lineHeight: 1.2 }}>{priorityInfo.text} Priority</Badge>
              </div>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} md={8}>
            <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5 h-100" style={{ borderColor: "#e2e8f0" }}>
              <h6 className="fw-bold text-dark border-bottom pb-3 mb-3">Description</h6>
              <p className="text-secondary mb-4" style={{ fontSize: "0.86rem", lineHeight: 1.6 }}>{task?.description || "No description available for this task."}</p>

              <h6 className="fw-bold text-dark border-bottom pb-3 mb-3"><FiFolder size={14} className="me-2 text-secondary" />Linked Project</h6>
              <div className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3" style={{ backgroundColor: "#f8fafc" }}>
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="d-flex align-items-center justify-content-center rounded-2 text-white flex-shrink-0" style={{ width: "30px", height: "30px", backgroundColor: "#6366f1" }}><FiBriefcase size={15} /></div>
                  <div className="min-w-0"><div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.78rem" }}>{relatedProject?.projectName || "Project"}</div><div className="text-secondary" style={{ fontSize: "0.68rem" }}>Status: {relatedProject?.status || "Planning"}</div></div>
                </div>
                {relatedProject && <Button size="sm" variant="outline-primary" className="rounded-pill flex-shrink-0" onClick={() => navigate(`/projects/${relatedProject._id}`)}>View Project</Button>}
              </div>
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5 h-100" style={{ borderColor: "#e2e8f0" }}>
              <h6 className="fw-bold text-dark border-bottom pb-3 mb-3"><FiUser size={14} className="me-2 text-secondary" />Assigned To</h6>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold" style={{ width: "32px", height: "32px", backgroundColor: "#8b5cf6", fontSize: "0.72rem" }}>{assignedUser?.name?.charAt(0).toUpperCase() || "U"}</div>
                <div><div className="fw-semibold text-dark" style={{ fontSize: "0.78rem" }}>{assignedUser?.name || (task?.assignedTo ? "Assigned User" : "Unassigned")}</div><div className="text-secondary" style={{ fontSize: "0.68rem" }}>Team Member</div></div>
              </div>
              <h6 className="fw-bold text-dark border-bottom pb-3 mb-3"><FiCalendar size={14} className="me-2 text-secondary" />Timing</h6>
              <div className="d-flex justify-content-between mb-2"><span className="text-secondary" style={{ fontSize: "0.7rem" }}>Created On</span><span className="fw-semibold text-dark" style={{ fontSize: "0.7rem" }}>{formatDate((task as (typeof task & { createdAt?: string }))?.createdAt || "")}</span></div>
              <div className="d-flex justify-content-between"><span className="text-secondary" style={{ fontSize: "0.7rem" }}>Due Date</span><span className="fw-semibold text-dark" style={{ fontSize: "0.7rem" }}>{formatDate(task?.dueDate || "")}</span></div>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default TaskDetails;