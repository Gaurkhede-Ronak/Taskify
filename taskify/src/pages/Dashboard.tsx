import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../src/redux/store";
import { fetchProjects, createProject } from "../../src/redux/slices/projectSlice";
import { getTasks } from "../../src/redux/tasks/taskSlice";
import { StatsCard } from "../components/dashboard/StatsCard";
import { ProjectProgress } from "../components/dashboard/ProjectProgress";
import { TaskOverview } from "../components/dashboard/TaskOverview";
import { ActivityList } from "../components/dashboard/ActivityList";
import { UniversalModal, type UniversalFormData } from "../components/UI/UniversalModal";
import { toast } from "react-toastify";
import { FaFolderOpen, FaCheckCircle, FaPlus, FaFolder, FaClock, FaChartLine } from "react-icons/fa";
import { FiBriefcase } from "react-icons/fi";
import axiosInstance from "../api/axois";

interface DashboardUser { _id: string; name: string; }

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const userData = user?.data ? user.data : user;
  const firstName = (userData?.name || "User").split(" ")[0];

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(getTasks());
    axiosInstance.get("/auth/getAllUsers").then((response: { data?: { data?: DashboardUser[] } }) => {
      const usersData = response.data?.data;
      if (Array.isArray(usersData)) setUsers(usersData);
    }).catch(() => undefined);
  }, [dispatch]);

  const projectId = (value: string | { _id?: string } | undefined) => typeof value === "string" ? value : value?._id;
  const tasksForProject = (id: string) => tasks.filter((task) => projectId(task.project) === id);
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const completedPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const inProgressPercent = tasks.length ? Math.round((inProgressCount / tasks.length) * 100) : 0;
  const todoPercent = tasks.length ? Math.round((todoCount / tasks.length) * 100) : 0;
  const colors = [["#ecfdf5", "#10b981"], ["#eff6ff", "#2563eb"], ["#fdf2f8", "#ec4899"], ["#f5f3ff", "#a855f7"]];

  const myProjects = projects.slice(0, 4).map((project, index) => {
    const projectTasks = tasksForProject(project._id);
    const projectCompleted = projectTasks.filter((task) => task.status === "completed").length;
    const progress = projectTasks.length ? Math.round((projectCompleted / projectTasks.length) * 100) : project.status === "completed" ? 100 : 0;
    return {
      name: project.projectName,
      tasksCount: `${projectTasks.length} task${projectTasks.length === 1 ? "" : "s"}`,
      progress,
      iconBg: colors[index % colors.length][0],
      iconColor: colors[index % colors.length][1],
      icon: <FaFolderOpen size={20} />,
      progressColor: progress === 100 ? "#10b981" : "#2563eb",
    };
  });

  const projectNames = new Map(projects.map((project) => [project._id, project.projectName]));
  const userNames = new Map(users.map((dashboardUser) => [dashboardUser._id, dashboardUser.name]));
  const upcomingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((first, second) => new Date(first.dueDate || 0).getTime() - new Date(second.dueDate || 0).getTime())
    .slice(0, 3)
    .map((task) => ({
      title: task.taskName,
      project: projectNames.get(projectId(task.project) || "") || "Project",
      timeText: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date",
      timeColor: task.status === "in-progress" ? "#2563eb" : "#64748b",
      iconBg: task.status === "in-progress" ? "#eff6ff" : "#f1f5f9",
      iconColor: task.status === "in-progress" ? "#2563eb" : "#64748b",
      taskIcon: <FiBriefcase size={16} />,
    }));
  const recentActivities = [...tasks]
    .sort((first, second) => new Date(second.updatedAt || second.createdAt || 0).getTime() - new Date(first.updatedAt || first.createdAt || 0).getTime())
    .slice(0, 3)
    .map((task) => ({
      user: userNames.get(String(task.assignedTo || "")) || "You",
      action: task.status === "completed" ? "completed" : task.updatedAt && task.updatedAt !== task.createdAt ? "updated task" : "created task",
      target: task.taskName,
      time: task.updatedAt || task.createdAt ? new Date(task.updatedAt || task.createdAt || "").toLocaleDateString() : "Recently",
      avatar: userNames.get(String(task.assignedTo || "")) || "You",
      assigneeInitial: (userNames.get(String(task.assignedTo || "")) || "You").charAt(0).toUpperCase(),
    }));

  const handleCreateProject = async (data: UniversalFormData) => {
    if (!data.title.trim()) return toast.error("Project name is required.");
    setIsSubmitting(true);
    try {
      await dispatch(createProject({
        projectName: data.title.trim(),
        description: data.description.trim() || "No description",
        priority: data.priority,
        status: data.status,
        members: data.members
          ? data.members.split(",").map((member) => member.trim()).filter((member) => /^[0-9a-fA-F]{24}$/.test(member))
          : [],
        dueDate: data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`).toISOString() : undefined,
      })).unwrap();
      toast.success("Project created successfully!");
      setShowProjectModal(false);
    } catch (error: any) {
      toast.error(error.message || "Unable to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="px-3 py-4 p-md-4 p-xl-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="p-4 p-md-5 rounded-4 mb-4 mb-xl-5 text-white position-relative overflow-hidden shadow-sm" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill text-white fw-bold mb-3" style={{ fontSize: "12px", backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
            <Image src="/logo.png" alt="Logo" width={16} height={16} className="rounded-1 object-fit-cover" /> Taskify
          </div>
          <h2 className="fw-bolder mb-2 text-white" style={{ fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.5px" }}>Welcome back, {firstName} !</h2>
          <p className="mb-4 fw-medium" style={{ fontSize: "clamp(13px, 1.5vw, 15px)", maxWidth: "550px", color: "rgba(255, 255, 255, 0.85)" }}>
            Your teams have completed <strong className="text-white">{completedPercent}%</strong> of their tasks.
          </p>
          <Button onClick={() => setShowProjectModal(true)} className="fw-bold px-4 py-2.5 rounded-pill border-0 shadow-sm d-inline-flex align-items-center gap-2 mt-1" style={{ backgroundColor: "#ffffff", color: "#4f46e5", fontSize: "14px" }}>
            <FaPlus size={13} /> New Project
          </Button>
        </div>
      </div>

      <Row className="g-3 g-md-4 mb-4 mb-xl-5">
        <Col xs={6} lg={3}><StatsCard title="PROJECTS" value={projects.length.toString().padStart(2, "0")} borderColor="#4f46e5" icon={<FaFolder size={18} />} /></Col>
        <Col xs={6} lg={3}><StatsCard title="TASKS" value={tasks.length} borderColor="#10b981" icon={<FaCheckCircle size={18} />} /></Col>
        <Col xs={6} lg={3}><StatsCard title="IN PROGRESS" value={inProgressCount} progress={inProgressPercent} progressVariant="warning" borderColor="#f59e0b" icon={<FaClock size={18} />} /></Col>
        <Col xs={6} lg={3}><StatsCard title="COMPLETED" value={`${completedPercent}%`} progress={completedPercent} progressVariant="success" borderColor="#8b5cf6" icon={<FaChartLine size={18} />} /></Col>
      </Row>

      <Row className="g-4 mb-4 mb-xl-5">
        <Col xs={12} lg={7}><ProjectProgress projects={myProjects} /></Col>
        <Col xs={12} lg={5}><TaskOverview totalTasks={tasks.length} completedCount={completedCount} completedPercent={completedPercent} inProgressCount={inProgressCount} inProgressPercent={inProgressPercent} toDoCount={todoCount} toDoPercent={todoPercent} /></Col>
      </Row>

      <Row className="g-4 pb-4"><Col xs={12}><ActivityList upcomingTasks={upcomingTasks} recentActivities={recentActivities} /></Col></Row>
      <UniversalModal show={showProjectModal} onHide={() => setShowProjectModal(false)} type="project" mode="create" loading={isSubmitting} onSubmit={handleCreateProject} />
    </Container>
  );
};

export default Dashboard;
