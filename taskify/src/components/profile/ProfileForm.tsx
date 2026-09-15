import { useState, useEffect } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import type { RootState } from "../../redux/store"; 
import { ProfileHeader } from "./ProfileHeader";

export const ProfileForm = () => {

  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();


  const userData = user?.data ? user.data : user;

  const [name, setName] = useState(userData?.name || "Ronak");
  const [email, setEmail] = useState(userData?.email || "ronak@example.com");
  const [bio] = useState("Passionate about creating beautiful frontend experiences with React.js and modern web technologies.");
  const [location, setLocation] = useState("Ahmedabad, Gujarat, India");

  useEffect(() => {
    if (userData?.name) setName(userData.name);
    if (userData?.email) setEmail(userData.email);
  }, [userData]);

  return (
    <div className="w-100 d-flex justify-content-center px-0 px-md-2">
      <Card 
        className="border-0 rounded-4 p-3 p-sm-4 p-md-5 bg-white shadow-sm w-100" 
        style={{ maxWidth: "850px", border: "1px solid #f1f5f9" }}
      >
        {/* Header with Mobile-Only Dashboard Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "16px", letterSpacing: "-0.5px" }}>
            Profile Information
          </h5>
          
          {/* Visible ONLY on mobile screens, matches primary button styling */}
          <Button 
            onClick={() => navigate("/dashboard")}
            className="d-flex d-md-none align-items-center fw-bold text-white border-0 shadow-sm"
            style={{ 
              fontSize: "12px", 
              padding: "6px 14px", 
              backgroundColor: "#2563eb", 
              borderRadius: "50rem" 
            }}
          >
            <FaArrowLeft size={11} className="me-2" /> Dashboard
          </Button>
        </div>

        <ProfileHeader 
          name={name}
          email={email}
          role="Frontend Developer"
        />

        <Form className="d-flex flex-column gap-3 gap-md-4 mt-2">
          <Form.Group>
            <Form.Label className="fw-semibold text-secondary mb-1.5" style={{ fontSize: "12px" }}>Full Name</Form.Label>
            <Form.Control 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="py-2.5 rounded-3 border-0 shadow-none text-dark fw-medium" 
              style={{ fontSize: "14px", backgroundColor: "#f8fafc" }} 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold text-secondary mb-1.5" style={{ fontSize: "12px" }}>Email</Form.Label>
            <Form.Control 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="py-2.5 rounded-3 border-0 shadow-none text-dark fw-medium" 
              style={{ fontSize: "14px", backgroundColor: "#f8fafc" }} 
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold text-secondary mb-1.5" style={{ fontSize: "12px" }}>Location</Form.Label>
            <Form.Control 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="py-2.5 rounded-3 border-0 shadow-none text-dark fw-medium" 
              style={{ fontSize: "14px", backgroundColor: "#f8fafc" }} 
            />
          </Form.Group>

          <div className="mt-2">
            <Button 
              className="fw-bold px-4 py-2.5 rounded-pill border-0 shadow-sm text-white"
              style={{ backgroundColor: "#2563eb", fontSize: "14px" }}
              onClick={() => console.log("Save details:", { name, email, bio, location })}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};