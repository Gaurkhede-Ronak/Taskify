import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Spinner, Badge, Row, Col, Dropdown } from "react-bootstrap";
import {
  FiArrowLeft,
  FiDatabase,
  FiFolder,
  FiGlobe,
  FiPenTool,
  FiPlus,
  FiSmartphone,
  FiTrendingUp,
  FiCheckSquare,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchProjects, updateProject } from "../redux/slices/projectSlice";
import { createNewTask, removeTask, updateExistingTask, type Task } from "../redux/tasks/taskSlice";
import { fetchTasksByProjectAPI } from "../api/taskApi";
import { UniversalModal, type UniversalFormData } from "../components/UI/UniversalModal";
import { ComponentTable, DeleteConfirmationModal } from "../components/UI/ComponentTable";
import axiosInstance from "../api/axois";
import { toast } from "react-toastify";

interface ProjectDetailData {
  _id: string;
  projectName: string;
  description: string;
  status: string;
  priority: string;
  members?: string[] | unknown[] | string;
  dueDate?: string;
  owner?: string | { _id?: string; name?: string };
  createdAt?: string;
}

interface UserOption {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

type TaskFilter = "all" | Task["status"];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const projects = useSelector((state: RootState) => state.projects.projects);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [customMemberNames, setCustomMemberNames] = useState<string[]>([]);
  const [customMembersLoaded, setCustomMembersLoaded] = useState(false);

  useEffect(() => {
    if (!projects.length) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const loadProjectTasks = async () => {
      try {
        setTasksLoading(true);
        const response = await fetchTasksByProjectAPI(projectId);
        const responseData = response as { data?: { tasks?: Task[] } };
        setProjectTasks(Array.isArray(responseData.data?.tasks) ? responseData.data.tasks : []);
      } catch {
        toast.error("Unable to load project tasks.");
      } finally {
        setTasksLoading(false);
      }
    };
    void loadProjectTasks();
  }, [projectId]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axiosInstance.get("/auth/getAllUsers");
      const responseData = response.data as { data?: UserOption[] };
      setUsers(Array.isArray(responseData.data) ? responseData.data : []);
    } catch {
      toast.error("Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setCustomMembersLoaded(false);
      return;
    }
    setCustomMembersLoaded(false);
    try {
      const savedNames = JSON.parse(localStorage.getItem(`taskify:project-members:${projectId}`) || "[]");
      setCustomMemberNames(Array.isArray(savedNames) ? savedNames.filter((name): name is string => typeof name === "string" && Boolean(name.trim())) : []);
    } catch {
      setCustomMemberNames([]);
    } finally {
      setCustomMembersLoaded(true);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && customMembersLoaded) localStorage.setItem(`taskify:project-members:${projectId}`, JSON.stringify(customMemberNames));
  }, [customMemberNames, customMembersLoaded, projectId]);

  const project = useMemo<ProjectDetailData | null>(
    () => projects.find((item) => item._id === projectId) ?? null,
    [projects, projectId]
  );

  const projectAccent = useMemo(() => {
    if (!project?.projectName) return "#6366f1"; // Primary Purple/Indigo
    const colors = ["#6366f1", "#0d9488", "#d97706", "#8b5cf6", "#e11d48", "#0284c7"];
    const total = project.projectName.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return colors[total % colors.length];
  }, [project?.projectName]);

  const normalizeMemberNames = (value: unknown): string[] => {
    const names: string[] = [];
    const visit = (entry: unknown) => {
      if (Array.isArray(entry)) {
        entry.forEach(visit);
        return;
      }
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        if (trimmed) {
          const matchedUser = users.find((u) => u._id === trimmed);
          names.push(matchedUser ? matchedUser.name : trimmed);
        }
        return;
      }
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const directName = [record.name, record.username, record.email].find((item): item is string => typeof item === "string" && item.trim().length > 0);
        if (directName) {
          names.push(directName.trim());
          return;
        }
        if (record.members !== undefined) {
          visit(record.members);
        }
      }
    };
    visit(value);
    return [...new Set(names.map((name) => name.replace(/\s+/g, " ").trim()).filter(Boolean))];
  };

  const normalizedMembers = useMemo(
    () => [...new Set([...normalizeMemberNames(project?.members), ...customMemberNames])],
    [project?.members, customMemberNames, users]
  );

  const visibleTasks = useMemo(
    () => taskFilter === "all" ? projectTasks : projectTasks.filter((task) => task.status === taskFilter),
    [projectTasks, taskFilter]
  );

  const taskCounts = useMemo(() => ({
    all: projectTasks.length,
    todo: projectTasks.filter((task) => task.status === "todo").length,
    "in-progress": projectTasks.filter((task) => task.status === "in-progress").length,
    completed: projectTasks.filter((task) => task.status === "completed").length,
  }), [projectTasks]);

  const tabItems = ["Overview", "Tasks", "Members", "Settings"];

  const progressValue = useMemo(() => {
    if (!project?.status) return 10;
    if (project.status === "planning") return 10;
    if (project.status === "active") return 50;
    if (project.status === "completed") return 100;
    return 10;
  }, [project?.status]);

  const formatDate = (value?: string) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMemberInitials = (member: string) => {
    if (member === "No members assigned") return "N";
    return member.trim().charAt(0).toUpperCase() || "N";
  };

  const getIconColor = (name: string) => {
    const colors = ["#2563eb", "#0f766e", "#d97706", "#dc2626", "#4f46e5", "#db2777"];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  const getProjectIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("web") || lowerName.includes("e-commerce") || lowerName.includes("site")) return <FiGlobe size={24} />;
    if (lowerName.includes("app") || lowerName.includes("mobile")) return <FiSmartphone size={24} />;
    if (lowerName.includes("design") || lowerName.includes("ui") || lowerName.includes("portfolio")) return <FiPenTool size={24} />;
    if (lowerName.includes("market") || lowerName.includes("campaign") || lowerName.includes("seo")) return <FiTrendingUp size={24} />;
    if (lowerName.includes("data") || lowerName.includes("backend") || lowerName.includes("api")) return <FiDatabase size={24} />;
    return <FiFolder size={24} />;
  };

  const userOptions = users.filter((user) => user.name?.trim()).map((user) => ({ value: user._id, label: user.name }));

  const handleTaskSubmit = async (data: UniversalFormData) => {
    if (!data.title.trim() || !project) return toast.error("Task name is required.");
    try {
      const payload: Partial<Task> = {
        taskName: data.title.trim(),
        description: data.description.trim() || "No description",
        project: project._id,
        assignedTo: data.assignedTo?.trim() || undefined,
        priority: data.priority as Task["priority"],
        status: data.status as Task["status"],
        dueDate: data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`).toISOString() : undefined,
      };
      if (taskToEdit) {
        await dispatch(updateExistingTask({ taskId: taskToEdit._id, taskData: payload })).unwrap();
        toast.success("Task updated successfully!");
      } else {
        const response = await dispatch(createNewTask(payload)).unwrap();
        const createdTask = response?.data?.task as Task | undefined;
        if (createdTask) setProjectTasks((currentTasks) => [...currentTasks, createdTask]);
        toast.success("Task created successfully!");
      }
      setShowTaskModal(false);
      setTaskToEdit(null);
      if (taskToEdit) {
        const refreshedTasks = await fetchTasksByProjectAPI(project._id);
        const refreshedData = refreshedTasks.data?.tasks;
        if (Array.isArray(refreshedData)) setProjectTasks(refreshedData);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to save task.");
    }
  };

  const handleTaskDelete = async () => {
    if (!taskToDelete) return;
    try {
      await dispatch(removeTask(taskToDelete._id)).unwrap();
      setProjectTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskToDelete._id));
      toast.success("Task deleted successfully!");
    } catch {
      toast.error("Unable to delete task.");
    } finally {
      setTaskToDelete(null);
    }
  };

  const openAddMember = () => {
    setEditingMemberIndex(null);
    setNewMemberName("");
    setShowAddMember(true);
    if (users.length === 0) {
      void loadUsers();
    }
  };

  const openEditMember = (memberName: string, index: number) => {
    setEditingMemberIndex(index);
    setNewMemberName(memberName);
    setShowAddMember(true);
  };

  const closeMemberModal = () => {
    setShowAddMember(false);
    setNewMemberName("");
    setEditingMemberIndex(null);
  };

  const handleMemberSubmit = async () => {
    if (!project || !newMemberName.trim()) return;
    try {
      setIsAddingMember(true);
      const cleanName = newMemberName.trim();
      if (editingMemberIndex === null) {
        setCustomMemberNames((currentNames) => currentNames.some((name) => name.toLowerCase() === cleanName.toLowerCase()) ? currentNames : [...currentNames, cleanName]);
      } else {
        const oldName = normalizedMembers[editingMemberIndex];
        setCustomMemberNames((currentNames) => currentNames.map((name) => name.toLowerCase() === oldName?.toLowerCase() ? cleanName : name));
      }
      closeMemberModal();
      dispatch(fetchProjects());
      toast.success(editingMemberIndex === null ? "Member added successfully!" : "Member updated successfully!");
    } catch {
      toast.error(editingMemberIndex === null ? "Unable to add member." : "Unable to update member.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteMember = async (memberIndex: number) => {
    if (!project) return;
    try {
      setIsAddingMember(true);
      const memberName = normalizedMembers[memberIndex];
      if (customMemberNames.some((name) => name.toLowerCase() === memberName?.toLowerCase())) {
        setCustomMemberNames((currentNames) => currentNames.filter((name) => name.toLowerCase() !== memberName.toLowerCase()));
        toast.success("Member deleted successfully!");
        return;
      }
      const updatedMembers = normalizedMembers.filter((_, index) => index !== memberIndex);
      await dispatch(
        updateProject({
          ...project,
          _id: project._id,
          members: updatedMembers,
          owner: typeof project.owner === "object" ? project.owner?._id : project.owner,
        })
      ).unwrap();
      dispatch(fetchProjects());
      toast.success("Member deleted successfully!");
    } catch {
      toast.error("Unable to delete member.");
    } finally {
      setIsAddingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh", backgroundColor: "#f8fafc" }}>
        <Spinner animation="border" style={{ color: "#4f46e5" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5">
        <Card className="text-center shadow-sm border-0 p-5 rounded-4">
          <h4 className="fw-bold mb-3 text-dark">Project not found</h4>
          <p className="text-secondary mb-4">The project you are trying to view is not available.</p>
          <Button style={{ backgroundColor: "#4f46e5", border: "none" }} onClick={() => navigate("/projects")}>Back to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "1280px" }}>
        
        {/* Top Back Button */}
        <div className="mb-4">
          <Button
            variant="white"
            className="d-inline-flex align-items-center gap-2 shadow-sm rounded-pill fw-semibold text-dark border"
            onClick={() => navigate("/projects")}
            style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", padding: "8px 20px", fontSize: "14px" }}
          >
            <FiArrowLeft size={16} />
            Projects Details
          </Button>
        </div>

        {/* Main Project Details Container */}
        <div className="bg-white shadow-sm" style={{ borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          
          {/* Header Section (Icon, Title, Tabs) */}
          <div className="p-4 p-md-5 border-bottom border-light-subtle">
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-4">
              
              {/* Icon and Title */}
              <div className="d-flex align-items-center gap-3 gap-md-4">
                <div
                  className="d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "14px",
                    backgroundColor: projectAccent,
                  }}
                >
                  {getProjectIcon(project.projectName || "Project")}
                </div>
                <h2 className="mb-0 fw-bold text-dark" style={{ letterSpacing: "-0.5px", lineHeight: "1.2", fontSize: "1.8rem" }}>
                  {project.projectName}
                </h2>
              </div>

              {/* Tabs Container */}
              <div className="d-flex p-1 bg-light border border-light-subtle rounded-pill overflow-auto flex-shrink-0">
                {tabItems.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold border-0 ${activeTab === tab ? "bg-white shadow-sm text-dark" : "text-secondary"}`}
                    onClick={() => setActiveTab(tab)}
                    style={{ fontSize: "14px", whiteSpace: "nowrap", transition: "all 0.2s ease" }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-4 p-md-5 bg-white">
            {activeTab === "Settings" ? (
              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: "280px" }}>
                <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "78px", height: "78px", color: projectAccent, backgroundColor: `${projectAccent}18` }}>
                  <FiFolder size={38} strokeWidth={1.7} />
                </div>
                <h4 className="mb-0 fw-bold text-dark">Settings</h4>
              </div>
            ) : activeTab === "Tasks" ? (
              <div>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    {(["all", "todo", "in-progress", "completed"] as TaskFilter[]).map((filter) => (
                      <Button key={filter} type="button" size="sm" variant={taskFilter === filter ? "primary" : "light"} className="rounded-pill border px-3 fw-semibold" onClick={() => setTaskFilter(filter)}>
                        {filter === "all" ? "All" : filter === "todo" ? "To Do" : filter === "in-progress" ? "In Progress" : "Done"} ({taskCounts[filter]})
                      </Button>
                    ))}
                  </div>
                  <Button className="border-0 rounded-pill px-3 py-2 fw-semibold text-white shadow-sm" style={{ backgroundColor: projectAccent }} onClick={() => { setTaskToEdit(null); setShowTaskModal(true); }}>
                    <FiPlus size={15} className="me-1" /> Add Task
                  </Button>
                </div>
                <ComponentTable
                  type="task"
                  data={visibleTasks}
                  loading={tasksLoading}
                  showToolbar={false}
                  maxWidth={1280}
                  onEdit={(task) => { setTaskToEdit(task as Task); setShowTaskModal(true); }}
                  onDelete={(taskId) => setTaskToDelete(projectTasks.find((task) => task._id === taskId) || null)}
                  assignedToOptions={userOptions}
                  emptyState={{ title: "No tasks in this status", description: "Try another status filter or add a new task.", icon: <FiCheckSquare size={28} /> }}
                />
              </div>
            ) : activeTab === "Members" ? (
              <div>
                <style>{`
                  .member-actions-toggle::after { display: none !important; }
                  .member-actions-menu { min-width: 170px; padding: 0.4rem; border: 1px solid #e2e8f0 !important; border-radius: 12px; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.14); }
                  .member-actions-menu .dropdown-item { padding: 0.65rem 0.75rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; }
                  .universal-form-control { min-height: 44px; color: #0f172a; background-color: #fbfdff; border: 1px solid #dbe3ef; transition: all 0.2s ease; font-size: 14px; }
                  .universal-form-control::placeholder { color: #94a3b8; }
                  .universal-form-control:focus, .universal-form-control.show { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important; outline: none; }
                  .universal-select-toggle::after { display: none; }
                  .universal-select-menu { margin-top: 4px !important; border: 1px solid #e2e8f0 !important; border-radius: 12px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14); max-height: 240px; overflow-y: auto; }
                  .universal-select-menu .dropdown-item { color: #334155; font-size: 14px; font-weight: 500; }
                  .universal-select-menu .dropdown-item:hover { color: #1d4ed8; background-color: #eff6ff; }
                `}</style>
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <h4 className="mb-0 fw-bold text-dark">Project Team ({normalizedMembers.length})</h4>
                  <Button className="border-0 rounded-pill px-3 py-2 fw-semibold text-white shadow-sm" style={{ backgroundColor: projectAccent, whiteSpace: "nowrap" }} onClick={openAddMember}>
                    <FiPlus size={15} className="me-1" /> Add Member
                  </Button>
                </div>
                {normalizedMembers.length > 0 ? (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
                    {normalizedMembers.map((memberName, index) => (
                      <div className="col" key={`${memberName}-${index}`}>
                        <div className="d-flex align-items-center gap-3 p-3 bg-light-subtle border rounded-4" style={{ minHeight: "80px", borderColor: "#e2e8f0" }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0" style={{ width: "44px", height: "44px", backgroundColor: getIconColor(memberName), fontSize: "16px" }}>
                            {getMemberInitials(memberName)}
                          </div>
                          <div className="min-w-0 flex-grow-1">
                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: "14px" }}>{memberName}</div>
                            <div className="text-secondary" style={{ fontSize: "12px" }}>Team Member</div>
                          </div>
                          <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                            <Dropdown.Toggle variant="light" className="member-actions-toggle border-0 bg-transparent text-secondary shadow-none p-1" aria-label={`Actions for ${memberName}`}>
                              <FiMoreVertical size={18} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="member-actions-menu">
                              <Dropdown.Item onClick={() => openEditMember(memberName, index)}><FiEdit2 size={15} className="me-2 text-secondary" />Edit Member</Dropdown.Item>
                              <Dropdown.Item className="text-danger" onClick={() => void handleDeleteMember(index)}><FiTrash2 size={15} className="me-2" />Delete Member</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-secondary py-5 border rounded-4">No members assigned</div>
                )}
              </div>
            ) : (
            <Row className="g-4">
              
              {/* Left Column (About Project) */}
              <Col xs={12} lg={7} xl={8}>
                <div className="h-100 p-4 p-md-5 rounded-4" style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
                  
                  <>
                      <h4 className="fw-bold mb-4 text-dark">About Project</h4>
                      <p className="text-secondary mb-5" style={{ fontSize: "15px", lineHeight: "1.7" }}>
                        {project.description || "No description available yet."}
                      </p>

                      <div className="d-flex flex-column gap-4 mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary fw-medium" style={{ fontSize: "15px" }}>Start Date</span>
                          <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>{formatDate(project.createdAt)}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary fw-medium" style={{ fontSize: "15px" }}>Due Date</span>
                          <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>{formatDate(project.dueDate)}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary fw-medium" style={{ fontSize: "15px" }}>Status</span>
                          <Badge
                            className="rounded-pill px-4 py-2 border-0"
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              backgroundColor: project.status === "completed" ? "#10b981" : project.status === "active" ? "#3b82f6" : "#facc15",
                              color: project.status === "planning" ? "#1e293b" : "#ffffff"
                            }}
                          >
                            {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Planning"}
                          </Badge>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary fw-medium" style={{ fontSize: "15px" }}>Priority</span>
                          <Badge
                            className="rounded-pill px-4 py-2 border-0"
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              backgroundColor: project.priority === "high" ? "#ef4444" : project.priority === "medium" ? "#facc15" : "#10b981",
                              color: project.priority === "medium" ? "#1e293b" : "#ffffff"
                            }}
                          >
                            {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : "Medium"}
                          </Badge>
                        </div>
                      </div>
                  </>
                </div>
              </Col>

              {/* Right Column (Progress & Compact Members) */}
              <Col xs={12} lg={5} xl={4} className="d-flex flex-column gap-4">
                
                {/* Progress Card */}
                <div className="p-4 p-md-5 rounded-4" style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
                  <h5 className="fw-bold mb-4 text-dark">Progress</h5>

                  <div className="d-flex justify-content-center mb-4 mt-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "180px",
                        height: "180px",
                        background: `conic-gradient(${projectAccent} ${progressValue * 3.6}deg, #e2e8f0 0deg)`,
                      }}
                    >
                      <div
                        className="d-flex flex-column align-items-center justify-content-center rounded-circle bg-white"
                        style={{ width: "135px", height: "135px" }}
                      >
                        <span className="fw-bolder text-dark" style={{ fontSize: "32px", letterSpacing: "-1px" }}>{progressValue}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                    <span className="text-secondary fw-medium" style={{ fontSize: "14px" }}>Progress tracker</span>
                    <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>{progressValue}%</span>
                  </div>
                  <div className="w-100 rounded-pill overflow-hidden" style={{ height: "10px", backgroundColor: "#e2e8f0" }}>
                    <div className="h-100 rounded-pill" style={{ width: `${progressValue}%`, backgroundColor: projectAccent, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {/* Team Members Compact Card */}
                <div className="p-4 p-md-5 rounded-4 flex-grow-1" style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
                  <h5 className="fw-bold mb-4 text-dark">Team Members</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {normalizedMembers.length > 0 ? (
                      normalizedMembers.map((memberName, idx) => (
                        <div key={idx} className="d-flex align-items-center p-1 pe-3 rounded-pill border" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                            style={{ width: "34px", height: "34px", fontSize: "13px", backgroundColor: getIconColor(memberName) }}
                          >
                            {getMemberInitials(memberName)}
                          </div>
                          <span className="ms-2 fw-semibold text-dark" style={{ fontSize: "14px" }}>{memberName.split(" ")[0]}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-secondary small w-100 mb-2">No members assigned yet.</span>
                    )}

                    <button
                      onClick={openAddMember}
                      className="btn btn-light rounded-pill border d-flex align-items-center gap-1 shadow-sm text-secondary px-3 py-1"
                      style={{ backgroundColor: "#ffffff", height: "44px" }}
                    >
                      <FiPlus size={16} />
                      <span className="fw-semibold small">Add</span>
                    </button>
                  </div>
                </div>

              </Col>
            </Row>
            )}
          </div>
        </div>
      </div>

      <UniversalModal
        show={showTaskModal}
        onHide={() => { setShowTaskModal(false); setTaskToEdit(null); }}
        type="task"
        mode={taskToEdit ? "edit" : "create"}
        initialData={taskToEdit ? {
          title: taskToEdit.taskName,
          description: taskToEdit.description,
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().slice(0, 10) : "",
          projectId: project._id,
          assignedTo: taskToEdit.assignedTo,
        } : { projectId: project._id }}
        loading={tasksLoading}
        onSubmit={handleTaskSubmit}
        projectOptions={[{ value: project._id, label: project.projectName }]}
        assignedToOptions={userOptions}
        hideProjectField
      />

      <DeleteConfirmationModal
        show={Boolean(taskToDelete)}
        title="Delete task?"
        itemName={taskToDelete?.taskName || "this task"}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleTaskDelete}
        loading={tasksLoading}
      />

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", zIndex: 1050, backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-4 shadow-lg p-4 mx-3" style={{ width: "100%", maxWidth: "450px", border: "1px solid #e2e8f0" }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="mb-0 fw-bold text-dark">{editingMemberIndex === null ? "Add Team Member" : "Edit Team Member"}</h5>
                <small className="text-secondary" style={{ fontSize: "12.5px" }}>Select a member from your database or enter a name</small>
              </div>
              <button type="button" className="btn-close shadow-none" onClick={closeMemberModal}></button>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold text-secondary small mb-0">Member Name</label>
                <span className="text-muted" style={{ fontSize: "11px" }}>
                  {usersLoading ? "Loading users..." : `${users.length} users in database`}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                  style={{
                    width: "44px",
                    height: "44px",
                    backgroundColor: newMemberName.trim() ? getIconColor(newMemberName) : "#cbd5e1",
                    fontSize: "16px",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {getMemberInitials(newMemberName)}
                </div>

                {/* Standard CustomSelect Dropdown matching Image 1 */}
                <Dropdown className="flex-grow-1">
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    className="universal-form-control universal-select-toggle rounded-3 w-100 d-flex align-items-center justify-content-between px-3 text-start shadow-none"
                  >
                    <span className={!newMemberName ? "text-muted" : "text-dark"}>
                      {newMemberName || "Select user..."}
                    </span>
                    <FiChevronDown size={16} className="text-secondary" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="universal-select-menu w-100 border-0 p-1">
                    {users.filter((u) => u.name?.trim()).length > 0 ? (
                      users
                        .filter((u) => u.name?.trim())
                        .map((u) => (
                          <Dropdown.Item
                            key={u._id}
                            eventKey={u.name}
                            onClick={() => setNewMemberName(u.name)}
                            className="d-flex align-items-center justify-content-between rounded-2 px-3 py-2"
                          >
                            {u.name}
                            {newMemberName === u.name && <FiCheck size={15} className="text-primary" />}
                          </Dropdown.Item>
                        ))
                    ) : (
                      <div className="text-muted p-2 text-center small">
                        {usersLoading ? "Loading users..." : "No users found in database"}
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="fw-semibold px-4 py-2 rounded-pill border" onClick={closeMemberModal}>
                Cancel
              </Button>
              <Button
                className="fw-semibold px-4 py-2 rounded-pill border-0 text-white shadow-sm"
                style={{ backgroundColor: projectAccent }}
                onClick={() => void handleMemberSubmit()}
                disabled={isAddingMember || !newMemberName.trim()}
              >
                {isAddingMember ? <Spinner size="sm" /> : editingMemberIndex === null ? "Add Member" : "Update Member"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;