import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchProjects, createProject, updateProject, deleteProject } from "../redux/slices/projectSlice";
import type { Project } from "../redux/slices/projectSlice";
import { toast } from "react-toastify";
import { ComponentTable, DeleteConfirmationModal } from "../components/UI/ComponentTable";
import { UniversalModal, type UniversalFormData } from "../components/UI/UniversalModal";
import { FaFolder } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

export const Projects = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ _id: string; projectName: string } | null>(null);

  const { projects, loading } = useSelector((state: RootState) => (state as any).projects);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.id || user?._id || user?.data?.id || user?.data?._id;

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter((p: any) => p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddNew = () => { setProjectToEdit(null); setShowModal(true); };
  const handleEdit = (project: Project) => { setProjectToEdit(project); setShowModal(true); };
  const handleViewProject = (project: Project) => { window.location.href = `/projects/${project._id}`; };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await dispatch(deleteProject(projectToDelete._id)).unwrap();
      toast.success("Project deleted successfully!");
    } catch (error) { toast.error("Unable to delete project."); } 
    finally { setProjectToDelete(null); }
  };

  const handleFormSubmit = async (data: UniversalFormData) => {
    if (!data.title.trim()) return toast.error("Project name is required.");
    try {
      const memberIds = data.members
        ? data.members.split(",").map((member) => member.trim()).filter((member) => /^[0-9a-fA-F]{24}$/.test(member))
        : [];
      const payload: any = {
        projectName: data.title.trim(), description: data.description.trim() || "No description",
        priority: data.priority, status: data.status,
        members: memberIds,
        dueDate: data.dueDate ? new Date(`${data.dueDate}T12:00:00.000Z`).toISOString() : undefined,
      };
      if (projectToEdit) {
        await dispatch(updateProject({ ...payload, _id: projectToEdit._id, owner: projectToEdit.owner })).unwrap();
        await dispatch(fetchProjects()).unwrap();
        toast.success("Project updated successfully!");
      } else {
        await dispatch(createProject(payload)).unwrap();
        toast.success("Project created successfully!");
      }
      setShowModal(false);
    } catch (error: any) { toast.error(error.message || "Unable to save project."); }
  };

  return (
    <Container fluid className="px-2 px-sm-3 px-md-4 py-3 py-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <ComponentTable
        type="project"
        data={filteredProjects}
        loading={loading}
        currentUserId={currentUserId ? String(currentUserId) : undefined}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search projects..."
        createLabel="Create New Project"
        onCreate={handleAddNew}
        onEdit={handleEdit}
        onView={handleViewProject}
        onDelete={(id, name) => setProjectToDelete({ _id: id, projectName: name })}
        emptyState={{ title: "No projects found", description: "Create a project to start tracking progress.", icon: <FaFolder size={28} />, iconBg: "#eef6ff", iconColor: "#2563eb" }}
      />

      <DeleteConfirmationModal
        show={Boolean(projectToDelete)} title="Delete project?" itemName={projectToDelete?.projectName || "this project"}
        onClose={() => setProjectToDelete(null)} onConfirm={confirmDelete} loading={loading}
      />

      <UniversalModal
        show={showModal} onHide={() => setShowModal(false)} type="project" mode={projectToEdit ? "edit" : "create"}
        initialData={projectToEdit ? {
          title: projectToEdit.projectName, description: projectToEdit.description, priority: projectToEdit.priority, status: projectToEdit.status,
          dueDate: projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().slice(0, 10) : "",
          members: Array.isArray(projectToEdit.members) && projectToEdit.members.length > 0
            ? (typeof projectToEdit.members[0] === "object" ? (projectToEdit.members[0] as any)?._id : String(projectToEdit.members[0]))
            : (typeof projectToEdit.members === "string" ? projectToEdit.members : ""),
        } : {}}
        loading={loading} onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

export default Projects;