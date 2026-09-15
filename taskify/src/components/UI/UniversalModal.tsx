import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col, Dropdown } from "react-bootstrap";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";
import axiosInstance from "../../api/axois";

export type UniversalFormData = {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  projectId?: string;
  assignedTo?: string;
  members?: string;
};

interface UniversalModalProps {
  show: boolean;
  onHide: () => void;
  type: "project" | "task";
  mode: "create" | "edit";
  initialData?: Partial<UniversalFormData>;
  loading: boolean;
  onSubmit: (data: UniversalFormData) => void;
  projectOptions?: { value: string; label: string }[];
  assignedToOptions?: { value: string; label: string }[];
  hideProjectField?: boolean;
  submitError?: string;
}

const CustomSelect = ({ value, options, onChange, placeholder = "Select...", disabled = false }: any) => {
  const selectedOption = options.find((opt: any) => opt.value === value);
  return (
    <Dropdown className="w-100">
      <Dropdown.Toggle
        as="button"
        type="button"
        disabled={disabled}
        className="universal-form-control universal-select-toggle rounded-3 w-100 d-flex align-items-center justify-content-between px-3 text-start shadow-none"
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <span className={!selectedOption ? "text-muted" : "text-dark"}>{selectedOption ? selectedOption.label : placeholder}</span>
        <FiChevronDown size={16} className="text-secondary" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="universal-select-menu w-100 border-0 p-1">
        {options.map((option: any) => (
          <Dropdown.Item key={option.value} eventKey={option.value} onClick={() => onChange(option.value)} className="d-flex align-items-center justify-content-between rounded-2 px-3 py-2">
            {option.label}
            {option.value === value && <FiCheck size={15} className="text-primary" />}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const UniversalModal: React.FC<UniversalModalProps> = ({ show, onHide, type, mode, initialData, loading, onSubmit, projectOptions = [], assignedToOptions = [], hideProjectField = false, submitError }) => {
  const isTask = type === "task";

  const [internalUserOptions, setInternalUserOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (assignedToOptions && assignedToOptions.length > 0) return;
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/auth/getAllUsers");
        const responseData = response.data as { data?: { _id: string; name: string }[] };
        if (Array.isArray(responseData.data)) {
          setInternalUserOptions(
            responseData.data
              .filter((u) => u.name?.trim())
              .map((u) => ({ value: u._id, label: u.name }))
          );
        }
      } catch (err) {
        console.error("Failed to load users for modal", err);
      }
    };
    if (show) {
      void fetchUsers();
    }
  }, [show, assignedToOptions]);

  const userListOptions = (assignedToOptions && assignedToOptions.length > 0)
    ? assignedToOptions
    : internalUserOptions;

  const [formData, setFormData] = useState<UniversalFormData>({
    title: "",
    description: "",
    priority: "medium",
    status: isTask ? "todo" : "planning",
    dueDate: "",
    projectId: "",
    assignedTo: "",
    members: "",
  });

  // INFINITE LOOP FIX: Only run this effect when modal opens ('show' changes) or explicit 'initialData' changes.
  useEffect(() => {
    if (show) {
      setFormData({
        title: initialData?.title || "",
        description: initialData?.description || "",
        priority: initialData?.priority || "medium",
        status: initialData?.status || (isTask ? "todo" : "planning"),
        dueDate: initialData?.dueDate || "",
        projectId: initialData?.projectId || (projectOptions.length > 0 ? projectOptions[0].value : ""),
        assignedTo: initialData?.assignedTo || "",
        members: initialData?.members || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initialData]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const priorityOpts = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const statusOpts = isTask
    ? [{ value: "todo", label: "To Do" }, { value: "in-progress", label: "In Progress" }, { value: "completed", label: "Completed" }]
    : [{ value: "planning", label: "Planning" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }];

  const titleLabel = isTask ? "Task Name" : "Project Name";
  const modalHeader = `${mode === "create" ? "Create New" : "Edit"} ${isTask ? "Task" : "Project"}`;

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg" dialogClassName="universal-modal">
      <style>{`
        .universal-modal .modal-content { border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16); overflow: hidden; max-height: calc(100vh - 2rem); }
        .universal-modal .modal-header .btn-close { display: none; }
        .univ-close-btn { width: 36px; height: 36px; color: #64748b; background: transparent; transition: all 0.2s ease; }
        .univ-close-btn:hover { color: #2563eb; background: #eff6ff; outline: none; }
        .universal-form-control { min-height: 44px; color: #0f172a; background-color: #fbfdff; border: 1px solid #dbe3ef; transition: all 0.2s ease; font-size: 14px; }
        .universal-form-control::placeholder { color: #94a3b8; }
        .universal-form-control:focus { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important; outline: none; }
        .universal-select-toggle::after { display: none; }
        .universal-select-menu { margin-top: 4px !important; border: 1px solid #e2e8f0 !important; border-radius: 12px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14); max-height: 240px; overflow-y: auto; }
        .universal-select-menu .dropdown-item { color: #334155; font-size: 14px; font-weight: 500; }
        .universal-select-menu .dropdown-item:hover { color: #1d4ed8; background-color: #eff6ff; }
        .universal-label { color: #334155; font-size: 12px; letter-spacing: 0.2px; font-weight: 600; margin-bottom: 6px; }
      `}</style>

      <Modal.Header className="border-0 px-4 pt-4 pb-2">
        <Modal.Title className="fw-bold fs-5 text-dark flex-grow-1">{modalHeader}</Modal.Title>
        <button type="button" className="univ-close-btn border-0 rounded-3 d-flex align-items-center justify-content-center" onClick={onHide}>
          <FiX size={20} strokeWidth={1.8} />
        </button>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {submitError && <div className="rounded-3 px-3 py-2 text-danger small mb-3" style={{ backgroundColor: "#fff1f2" }}>{submitError}</div>}
        <Form onSubmit={handleFormSubmit} className="d-flex flex-column gap-3">
          
          <Form.Group>
            <Form.Label className="universal-label">{titleLabel} <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" name="title" placeholder={`e.g. ${isTask ? 'Design Homepage' : 'E-commerce App'}`} className="universal-form-control rounded-3 py-2 shadow-none" value={formData.title} onChange={handleChange} required />
          </Form.Group>

          <Form.Group>
            <Form.Label className="universal-label">Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" placeholder="Brief description..." className="universal-form-control rounded-3 py-2 shadow-none" style={{ minHeight: "78px", resize: "vertical" }} value={formData.description} onChange={handleChange} />
          </Form.Group>

          {isTask && (
            <Row className="g-3">
              {!hideProjectField && <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="universal-label">Project <span className="text-danger">*</span></Form.Label>
                  <CustomSelect value={formData.projectId} onChange={(v: string) => setFormData({ ...formData, projectId: v })} options={projectOptions} placeholder="Select project" disabled={!projectOptions.length} />
                </Form.Group>
              </Col>}
              <Col xs={12} sm={hideProjectField ? 12 : 6}>
                <Form.Group>
                  <Form.Label className="universal-label">Assign To</Form.Label>
                  <CustomSelect value={formData.assignedTo} onChange={(v: string) => setFormData({ ...formData, assignedTo: v })} options={[{ value: "", label: "Unassigned" }, ...userListOptions]} placeholder="Select user" />
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="universal-label">Priority</Form.Label>
                <CustomSelect value={formData.priority} onChange={(v: string) => setFormData({ ...formData, priority: v })} options={priorityOpts} />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="universal-label">Status</Form.Label>
                <CustomSelect value={formData.status} onChange={(v: string) => setFormData({ ...formData, status: v })} options={statusOpts} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3">
            {!isTask && (
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="universal-label">Member</Form.Label>
                  <CustomSelect
                    value={formData.members}
                    onChange={(v: string) => setFormData({ ...formData, members: v })}
                    options={[{ value: "", label: "Unassigned" }, ...userListOptions]}
                    placeholder="Select member"
                  />
                </Form.Group>
              </Col>
            )}
            <Col xs={12} sm={isTask ? 12 : 6}>
              <Form.Group>
                <Form.Label className="universal-label">Due Date <span className="text-danger">*</span></Form.Label>
                <Form.Control type="date" name="dueDate" className="universal-form-control rounded-3 py-2 shadow-none" value={formData.dueDate} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={onHide} disabled={loading} className="px-4 py-2 rounded-3 fw-semibold text-secondary border-0" style={{ backgroundColor: "#f8fafc" }}>Cancel</Button>
            <Button type="submit" disabled={loading} className="px-4 py-2 rounded-3 fw-semibold border-0 text-white shadow-sm" style={{ backgroundColor: "#2563eb" }}>
              {loading ? <Spinner size="sm" animation="border" /> : (mode === "edit" ? "Update" : "Save")}
            </Button>
          </div>

        </Form>
      </Modal.Body>
    </Modal>
  );
};