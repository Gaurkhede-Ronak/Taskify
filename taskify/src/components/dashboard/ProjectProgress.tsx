import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

interface ProjectItem {
  name: string;
  tasksCount: string;
  progress: number;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  progressColor: string;
}

interface ProjectProgressProps {
  projects: ProjectItem[];
}

export const ProjectProgress = ({ projects }: ProjectProgressProps) => {
  return (
    <Card 
      // Responsive padding: p-3 on mobile, p-md-4 on tablet/laptop
      className="border-0 bg-white h-100 p-3 p-md-4" 
      style={{ borderRadius: "20px", boxShadow: "0px 4px 20px rgba(0,0,0,0.03)" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Fluid font size for title */}
        <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "clamp(16px, 2vw, 18px)" }}>
          My Projects
        </h5>
        <Link to="/projects" className="text-decoration-none fw-bold" style={{ fontSize: "13px", color: "#2563eb" }}>
          View all
        </Link>
      </div>

      <div className="d-flex flex-column gap-4">
        {projects.map((proj, index) => (
          <div key={index} className="d-flex align-items-center gap-3">
            
            {/* Left Box: Icon Only */}
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" 
              style={{ width: "42px", height: "42px", backgroundColor: proj.iconBg, color: proj.iconColor }}
            >
              {proj.icon}
            </div>

            {/* Right Box: Text, Percentage & Progress Bar */}
            {/* Added style={{ minWidth: 0 }} to prevent long text from breaking the flex layout on smaller tablets */}
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="lh-sm text-start text-truncate pe-3">
                  <h6 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: "14px" }}>{proj.name}</h6>
                  <span className="text-secondary fw-medium" style={{ fontSize: "11px" }}>{proj.tasksCount}</span>
                </div>
                <span className="fw-bold text-dark flex-shrink-0" style={{ fontSize: "13px" }}>{proj.progress}%</span>
              </div>
              
              {/* Progress bar */}
              <div
                className="rounded-pill w-100"
                role="progressbar"
                aria-valuenow={proj.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ height: "5px", backgroundColor: "#f1f5f9" }}
              >
                <div style={{ width: `${proj.progress}%`, height: "100%", backgroundColor: proj.progressColor, borderRadius: "50px" }} />
              </div>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
};