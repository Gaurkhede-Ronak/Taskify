import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Col,
  Form,
  Row,
} from "react-bootstrap";
import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store";
import { toast } from "react-toastify";

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const prefillEmail = (location.state as any)?.email || "";

  const formik = useFormik<LoginValues>({
    initialValues: {
      email: prefillEmail,
      password: "",
      rememberMe: false,
    },
    enableReinitialize: true,
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrorMessage("");
        const resultAction = await dispatch(
          loginUser({ email: values.email, password: values.password })
        );

        if (loginUser.fulfilled.match(resultAction)) {
          toast.success("Welcome back!", { position: "top-right" });
          window.setTimeout(() => navigate("/dashboard"), 500);
        } else {
          const message = resultAction.payload as string || "Login failed";
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
            Welcome back !
          </h1>
          <p className="text-secondary fs-6 mb-0">
            Sign in to continue to your Taskify account.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger py-2 small mb-3">{errorMessage}</div>
        )}

        <Form noValidate onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-4">
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

          <Form.Group className="mb-4">
            <Row className="align-items-center mb-2">
              <Col>
                <Form.Label className="fw-semibold text-dark small mb-0">Password</Form.Label>
              </Col>
              <Col xs="auto">
                <Link to="/forgot-password" className="small fw-semibold text-decoration-none" style={{ color: "#2563eb" }}>
                  Forgot password?
                </Link>
              </Col>
            </Row>

            <div className="position-relative">
              <Form.Control
                size="lg"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••••••"
                autoComplete="current-password"
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

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              label="Remember me"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              className="text-secondary user-select-none"
            />
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
            {formik.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Form>

        <div className="text-center mt-4 pt-2">
          <span className="text-secondary">Don't have an account? </span>
          <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: "#2563eb" }}>
            Create account
          </Link>
        </div>
      </div>

    </>
  );
};

export default Login;