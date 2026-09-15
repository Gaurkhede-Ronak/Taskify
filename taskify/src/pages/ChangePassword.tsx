import { useState } from "react";
import { Form, Button, Spinner, InputGroup, Row, Col, Card } from "react-bootstrap";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axois";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { useFormik } from "formik";
import * as Yup from "yup";

export const ChangePassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userEmail = currentUser?.email || (currentUser as any)?.data?.email || "";

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const toggleShow = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // --- Validation Schema ---
  const validationSchema = Yup.object({
    oldPassword: Yup.string()
      .required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), undefined], "New password and confirm password do not match!")
      .required("Please confirm your new password"),
  });

  // --- Formik Setup ---
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axiosInstance.patch("/auth/changePassword", {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });

        const data = response.data;

        if (data.success) {
          toast.success(data.message || "Password changed successfully! Please log in with your new password.");
          resetForm();

          // Clear backend refreshToken cookie
          try {
            await axiosInstance.post("/auth/logout");
          } catch {
            // ignore network/auth errors on logout
          }

          // Immediately log the user out from Redux and localStorage
          dispatch(logout());

          // Redirect to login page with email preserved
          navigate("/login", { replace: true, state: { email: userEmail } });
        } else {
          toast.error(data.message || "Failed to change password. Check your old password.");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Something went wrong while connecting to the server.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password Strength Logic
  const passwordLength = formik.values.newPassword.length;
  const passwordStrength = passwordLength === 0 ? 0 : passwordLength < 7 ? 1 : passwordLength < 8 ? 2 : 3;
  const strengthLabels = ["", "Needs work", "Good", "Strong"];
  const strengthColors = ["", "bg-warning", "bg-primary", "bg-success"];
  const textColors = ["", "text-warning", "text-primary", "text-success"];

  return (
    <div className="w-100 px-3 px-md-4 pt-3 pt-md-3" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>

      {/* Custom CSS for precise focus rings and icon transitions */}
      <style>{`
        .custom-input-group:focus-within { box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; border-color: #3b82f6 !important; }
        .custom-input:focus { box-shadow: none !important; }
        .input-icon-btn { cursor: pointer; transition: color 0.2s; }
        .input-icon-btn:hover { color: #2563eb !important; }
        .update-btn { transition: all 0.2s ease-in-out; }
        .update-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37,99,235,0.2); }
      `}</style>

      {/* 100% Bootstrap Utility Classes based Card - Optimized Width & Height */}
      <Card className="border-light-subtle shadow-sm rounded-4 w-100 mx-auto" style={{ maxWidth: "750px" }}>
        <Card.Body className="p-4 p-md-4">

          <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px", fontSize: "22px" }}>Change Password</h4>
          <p className="text-secondary mb-3" style={{ fontSize: "14.5px" }}>
            Update your password here to keep your account secure.
          </p>

          {/* Thicker HR Line */}
          <hr className="mb-4" style={{ height: "2px", backgroundColor: "#cbd5e1", border: "none", opacity: 0.8 }} />

          <Form onSubmit={formik.handleSubmit}>
            <Row>
              {/* Responsive Grid: Mobile(100%), Tablet(83%), Laptop(66%) */}
              <Col xs={12} md={10} lg={8}>

                {/* 1. Current Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: "13.5px" }}>Current Password</Form.Label>
                  <InputGroup 
                    className={`custom-input-group rounded-3 overflow-hidden border bg-white ${formik.touched.oldPassword && formik.errors.oldPassword ? 'border-danger' : 'border-light-subtle'}`}
                  >
                    <Form.Control 
                      type={showPassword.old ? "text" : "password"} 
                      name="oldPassword" 
                      placeholder="Enter current password" 
                      className="custom-input border-0"
                      style={{ height: "46px", fontSize: "14.5px" }}
                      value={formik.values.oldPassword} 
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <InputGroup.Text className="bg-white border-0 input-icon-btn text-secondary px-3" onClick={() => toggleShow("old")}>
                      {showPassword.old ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                  {formik.touched.oldPassword && formik.errors.oldPassword && (
                    <div className="text-danger mt-1 fw-medium" style={{ fontSize: "12.5px" }}>{formik.errors.oldPassword}</div>
                  )}
                </Form.Group>

                {/* 2. New Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: "13.5px" }}>New Password</Form.Label>
                  <InputGroup 
                    className={`custom-input-group rounded-3 overflow-hidden border bg-white ${formik.touched.newPassword && formik.errors.newPassword ? 'border-danger' : 'border-light-subtle'}`}
                  >
                    <Form.Control 
                      type={showPassword.new ? "text" : "password"} 
                      name="newPassword" 
                      placeholder="Enter new password"
                      className="custom-input border-0"
                      style={{ height: "46px", fontSize: "14.5px" }}
                      value={formik.values.newPassword} 
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <InputGroup.Text className="bg-white border-0 input-icon-btn text-secondary px-3" onClick={() => toggleShow("new")}>
                      {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <div className="text-danger mt-1 fw-medium" style={{ fontSize: "12.5px" }}>{formik.errors.newPassword}</div>
                  )}

                  {/* Password Strength Indicator */}
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary" style={{ fontSize: "12px" }}>Password strength</span>
                      <span className={`fw-bold ${textColors[passwordStrength]}`} style={{ fontSize: "12px" }}>
                        {strengthLabels[passwordStrength]}
                      </span>
                    </div>
                    <div className="progress bg-light" style={{ height: "5px", borderRadius: "10px" }}>
                      <div 
                        className={`progress-bar rounded-pill ${strengthColors[passwordStrength]}`} 
                        role="progressbar" 
                        style={{ width: `${(passwordStrength / 3) * 100}%`, transition: "width 0.3s ease" }}
                      />
                    </div>
                  </div>
                </Form.Group>

                {/* 3. Confirm New Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: "13.5px" }}>Confirm New Password</Form.Label>
                  <InputGroup 
                    className={`custom-input-group rounded-3 overflow-hidden border bg-white ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-danger' : 'border-light-subtle'}`}
                  >
                    <Form.Control 
                      type={showPassword.confirm ? "text" : "password"} 
                      name="confirmPassword" 
                      placeholder="Confirm your new password"
                      className="custom-input border-0"
                      style={{ height: "46px", fontSize: "14.5px" }}
                      value={formik.values.confirmPassword} 
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <InputGroup.Text className="bg-white border-0 input-icon-btn text-secondary px-3" onClick={() => toggleShow("confirm")}>
                      {showPassword.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="text-danger mt-1 fw-medium" style={{ fontSize: "12.5px" }}>{formik.errors.confirmPassword}</div>
                  )}
                </Form.Group>

                {/* Submit Button */}
                <div className="d-grid d-sm-flex mt-3">
                  <Button 
                    type="submit" 
                    disabled={formik.isSubmitting} 
                    className="update-btn rounded-pill fw-semibold border-0 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "#2563eb", height: "48px", minWidth: "160px", fontSize: "15px" }}
                  >
                    {formik.isSubmitting ? <Spinner size="sm" animation="border" /> : "Update Password"}
                  </Button>
                </div>

              </Col>
            </Row>
          </Form>

        </Card.Body>
      </Card>
    </div>
  );
};

export default ChangePassword;