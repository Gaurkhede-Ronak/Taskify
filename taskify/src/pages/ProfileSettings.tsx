import { Card } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";
import { ProfileForm } from "../components/profile/ProfileForm";
import ChangePassword from "./ChangePassword";

export const ProfileSettings = () => {

  const { activeTab } = useOutletContext<{ activeTab: string }>();

  return (

    <div className="w-100 d-flex justify-content-center">
      <div className="w-100" style={{ maxWidth: activeTab === "password" ? "1000px" : "850px" }}>
        
        {/* 1. Profile Information Tab */}
        {activeTab === "info" && <ProfileForm />}
        
        {/* 2. Change Password Tab */}
        {activeTab === "password" && <ChangePassword />}
        
        {/* 3. Notification Settings Tab */}
        {activeTab === "notifications" && (
          <Card className="border-0 rounded-4 p-4 p-md-5 bg-white shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
            <h5 className="fw-bolder mb-3 text-dark" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>Notification Settings</h5>
            <p className="text-secondary" style={{ fontSize: "14px" }}>Manage what alerts you receive and how they are delivered.</p>
          </Card>
        )}
        
        {/* 4. Account Settings Tab */}
        {activeTab === "account" && (
          <Card className="border-0 rounded-4 p-4 p-md-5 bg-white shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
            <h5 className="fw-bolder mb-3 text-dark" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>Account Settings</h5>
            <p className="text-secondary" style={{ fontSize: "14px" }}>Manage your account preferences and data here.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;