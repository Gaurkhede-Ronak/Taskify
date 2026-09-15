import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Form,
} from "react-bootstrap";
import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store";
import { toast } from "react-toastify";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  agreeTerms: Yup.boolean()
    .oneOf([true], "You must accept the Terms & Conditions"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const formik = useFormik<RegisterValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrorMessage("");
        const resultAction = await dispatch(
          registerUser({
            name: values.name,
            email: values.email,
            password: values.password,
          })
        );

        if (registerUser.fulfilled.match(resultAction)) {
          toast.success("Account created successfully!", { position: "top-right" });
          window.setTimeout(() => navigate("/login"), 500);
        } else {
          const message = resultAction.payload as string || "Registration failed";
          setErrorMessage(message);
          toast.error(message, { position: "top-right" });
        }
      } catch {
        setErrorMessage("Something went wrong!");
        toast.error("Something went wrong!", { position: "top-right" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="w-100 px-2 px-sm-3" style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div className="mb-4 pb-2">
          <h1 className="fw-bold mb-2" style={{ letterSpacing: "-1px", color: "#111827", fontSize: "2.25rem" }}>
            Create account
          </h1>
          <p className="text-secondary fs-6 mb-0">
            Create your Taskify account and get started.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>
        )}

        <Form noValidate onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark small mb-2">Full name</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              name="name"
              placeholder="Enter your full name"
              autoComplete="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.name && Boolean(formik.errors.name)}
              className="rounded-3 shadow-none py-2 fs-6"
              style={{ backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
            />
            <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark small mb-2">Email address</Form.Label>
            <Form.Control
              size="lg"
              type="email"
              name="email"
              placeholder="example@gmail.com"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.email && Boolean(formik.errors.email)}
              className="rounded-3 shadow-none py-2 fs-6"
              style={{ backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
            />
            <Form.Control.Feedback type="invalid">{formik.errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark small mb-2">Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                size="lg"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••••••"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.password && Boolean(formik.errors.password)}
                className="rounded-3 shadow-none pe-5 py-2 fs-6"
                style={{ backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
              />
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowPassword((prev) => !prev)}
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                style={{ cursor: "pointer", zIndex: 5 }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-danger small mt-1">{formik.errors.password}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark small mb-2">Confirm password</Form.Label>
            <div className="position-relative">
              <Form.Control
                size="lg"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••••••••••"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                className="rounded-3 shadow-none pe-5 py-2 fs-6"
                style={{ backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
              />
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                style={{ cursor: "pointer", zIndex: 5 }}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </span>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-danger small mt-1">{formik.errors.confirmPassword}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formik.values.agreeTerms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.agreeTerms && Boolean(formik.errors.agreeTerms)}
              className="text-secondary user-select-none"
              label={
                <>
                  I agree to the{" "}
                  <Link to="#" className="text-decoration-none fw-semibold" style={{ color: "#2563eb" }}>
                    Terms & Conditions
                  </Link>
                </>
              }
            />
            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
              <div className="text-danger small mt-1">{formik.errors.agreeTerms}</div>
            )}
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-semibold rounded-3 py-2 fs-6 border-0 text-white"
            style={{ 
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
              transition: "all 0.2s ease-in-out" 
            }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </Form>

        <div className="text-center mt-4 pt-2">
          <span className="text-secondary">Already have an account? </span>
          <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "#2563eb" }}>
            Sign in
          </Link>
        </div>
      </div>

    </>
  );
};

export default Register;