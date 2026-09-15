interface ProfileHeaderProps {
  name: string;
  email: string;
  role: string;
}

export const ProfileHeader = ({ name, email, role }: ProfileHeaderProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom" style={{ borderColor: "#f1f5f9" }}>
      <div 
        className="d-flex align-items-center justify-content-center rounded-circle shadow-sm fw-bold flex-shrink-0"
        style={{ 
          width: "64px", 
          height: "64px", 
          backgroundColor: "#2563eb", 
          color: "#ffffff",
          fontSize: "28px",
          border: "3px solid #ffffff"
        }}
      >
        {initial}
      </div>

      <div className="d-flex flex-column justify-content-center overflow-hidden">
        <h6 className="fw-bolder mb-1 text-dark text-truncate" style={{ fontSize: "16px", letterSpacing: "-0.3px" }}>{name}</h6>
        <p className="text-secondary mb-2 text-truncate" style={{ fontSize: "13px" }}>{email}</p>
        <div>
          <span 
            className="px-2 py-1 rounded-2 fw-semibold d-inline-block" 
            style={{ fontSize: "11px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  );
};