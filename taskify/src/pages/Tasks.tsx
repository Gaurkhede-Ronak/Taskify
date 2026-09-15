import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getTasks, createNewTask, updateExistingTask, removeTask, type Task } from "../redux/tasks/taskSlice";
import { fetchProjects, type Project } from "../redux/slices/projectSlice";
import { ComponentTable, DeleteConfirmationModal } from "../components/UI/ComponentTable";
import { UniversalModal, type UniversalFormData } from "../components/UI/UniversalModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFileCircleCheck } from "react-icons/fa6";
import axiosInstance from "../api/axois";

interface UserOption {
  _id: string;
  name: string;
  email?: string;
}

const isValidMongoObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value.trim());

export const Tasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialData, setInitialData] = useState<Partial<UniversalFormData>>({});
  const [taskToDelete, setTaskToDelete] = useState<{ _id: string; taskName: string } | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);

  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.id || user?._id || user?.data?.id || user?.data?._id || null;

  useEffect(() => {
    dispatch(getTasks());
    dispatch(fetchProjects());
    const loadUsers = async () => {
      try {
        const response = await axiosInstance.get("/auth/getAllUsers");
        const responseData = response.data as { data?: UserOption[] };
        setUsers(Array.isArray(responseData?.data) ? responseData.data : []);
      } catch {
        toast.error("Unable to load users.");
      }
    };
    void loadUsers();
  }, [dispatch]);

  const availableProjects: Project[] = Array.isArray(projects) ? projects.filter((project) => {
    if (!project || !project.owner) return true;
    return String(project.owner) === String(currentUserId);
  }) : [];

  const filteredTasks = tasks?.filter((task) => task.taskName?.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const projectOptions = availableProjects.map((p) => ({ value: p._id, label: p.projectName }));
  const assignedToOptions = users
    .filter((user) => user.name?.trim())
    .map((user) => ({ value: user._id, label: user.name }));

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingTaskId(null);
    setInitialData({ projectId: availableProjects[0]?._id || "" });
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setIsEditing(true);
    setEditingTaskId(task._id);
    setInitialData({
      title: task.taskName,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      projectId: task.project,
      assignedTo: task.assignedTo,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (data: UniversalFormData) => {
    if (!data.title.trim()) return toast.error("Task name is required.");
    if (!data.projectId || !isValidMongoObjectId(data.projectId)) return toast.error("Please select a valid Project.");
    try {
      const payload: Partial<Task> = {
        taskName: data.title.trim(), description: data.description.trim() || "No description", project: data.projectId,
        assignedTo: data.assignedTo?.trim() || undefined,
        priority: data.priority as Task["priority"], status: data.status as Task["status"],
        dueDate: data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`).toISOString() : undefined,
      };
      if (isEditing && editingTaskId) {
        await dispatch(updateExistingTask({ taskId: editingTaskId, taskData: payload })).unwrap();
        toast.success("Task updated successfully!");
      } else {
        await dispatch(createNewTask(payload)).unwrap();
        toast.success("Task created successfully!");
      }
      setShowModal(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to save task.");
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await dispatch(removeTask(taskToDelete._id)).unwrap();
      toast.success("Task deleted successfully!");
    } catch { toast.error("Unable to delete task."); } 
    finally { setTaskToDelete(null); }
  };

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4 py-3 py-md-4" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      
      <ComponentTable
        type="task"
        data={filteredTasks}
        loading={loading}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tasks..."
        createLabel="Create New Task"
        onCreate={openCreateModal}
        onView={(task) => navigate(`/tasks/${task._id}`)}
        onEdit={openEditModal}
        onDelete={(id, name) => setTaskToDelete({ _id: id, taskName: name })}
        assignedToOptions={assignedToOptions}
        emptyState={{ title: "No tasks found", description: "Create a task to start organizing your work.", icon: <FaFileCircleCheck size={28} />, iconBg: "#fff4e6", iconColor: "#f59e0b" }}
      />
      
      <DeleteConfirmationModal
        show={Boolean(taskToDelete)} title="Delete task?" itemName={taskToDelete?.taskName || "this task"}
        onClose={() => setTaskToDelete(null)} onConfirm={confirmDeleteTask} loading={loading}
      />

      <UniversalModal
        show={showModal} onHide={() => setShowModal(false)} type="task" mode={isEditing ? "edit" : "create"}
        initialData={initialData} loading={loading} onSubmit={handleFormSubmit} projectOptions={projectOptions} assignedToOptions={assignedToOptions}
      />
      
    </Container>
  );
};

export default Tasks;