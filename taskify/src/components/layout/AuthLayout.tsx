import {
  Col,
  Container,
  Image,
  Row,
} from "react-bootstrap";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <Container
      fluid
      className="auth-container-mobile-bg"
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        backgroundColor: "#ffffff",
        color: "#111827",
      }}
    >
      {/* CSS to inject mobile background watermark cleanly */}
      <style>
        {`
          @media (max-width: 767.98px) {
            .auth-container-mobile-bg {
              background-image: url('/logo.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: 65% auto;
            }
          }
        `}
      </style>

      <Row
        className="min-vh-100 align-items-center justify-content-center g-0"
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          position: "relative",
        }}
      >

        {/* ================= LAPTOP/DESKTOP LEFT LOGO ================= */}
        <Col
          md={6}
          lg={6}
          xl={6}
          className="d-none d-md-flex justify-content-center align-items-center"
          style={{
            minHeight: "100vh",
            zIndex: 1,
            padding: "40px",
          }}
        >
          <Image
            src="/logo.png"
            alt="Taskify"
            fluid
            style={{
              width: "80%",
              maxWidth: "420px",
              filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.06))",
            }}
          />
        </Col>

        {/* ================= FORM SECTION ================= */}
        <Col
          xs={12}
          md={6}
          lg={6}
          xl={6}
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "100vh",
            position: "relative",
            zIndex: 2,
            padding: "30px 16px",
          }}
        >
          <Row className="w-100 justify-content-center m-0">
            <Col
              xs={12}
              sm={10}
              md={11}
              lg={10}
              xl={9}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.88)", 
                backdropFilter: "blur(6px)",
                borderRadius: "16px",
                padding: "20px 10px",
              }}
            >
              <Outlet />
            </Col>
          </Row>
        </Col>

      </Row>
    </Container>
  );
};

export default AuthLayout;