import { Card, Dropdown } from "react-bootstrap";

interface TaskOverviewProps {
  totalTasks: number;
  completedCount: number;
  completedPercent: number;
  inProgressCount: number;
  inProgressPercent: number;
  toDoCount: number;
  toDoPercent: number;
}

export const TaskOverview = ({
  totalTasks,
  completedCount,
  completedPercent,
  inProgressCount,
  inProgressPercent,
  toDoCount,
  toDoPercent,
}: TaskOverviewProps) => {
  

  const chartTotal = completedCount + inProgressCount + toDoCount;
  const compP = chartTotal > 0 ? (completedCount / chartTotal) * 100 : 0;
  const inProgP = chartTotal > 0 ? (inProgressCount / chartTotal) * 100 : 0;
  const donutStyle = {
    background: `conic-gradient(
      #10b981 0% ${compP}%, 
      #2563eb ${compP}% ${compP + inProgP}%, 
      #9ca3af ${compP + inProgP}% 100%
    )`
  };

  return (
    <Card 

      className="border-0 bg-white h-100 d-flex flex-column p-3 p-xl-4" 
      style={{ borderRadius: "24px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-1">
        <h5 className="fw-bolder mb-0 text-dark" style={{ fontSize: "clamp(16px, 2vw, 18px)" }}>
          Task Overview
        </h5>
        <Dropdown>
          <Dropdown.Toggle variant="light" size="sm" className="bg-white border text-dark shadow-sm rounded-pill fw-bold px-3 py-1.5" style={{ fontSize: "12px", borderColor: "#e5e7eb" }}>
            This Week
          </Dropdown.Toggle>
        </Dropdown>
      </div>

      {/* Responsive Flex Container: Prevents large empty gaps on tablets and handles tight laptop screens */}
      <div className="d-flex flex-wrap justify-content-center justify-content-sm-around align-items-center mt-auto mb-auto gap-4">
        
        {/* Left: Premium 3-Color Donut Chart (flex-shrink-0 prevents it from becoming oval) */}
        <div 
          className="rounded-circle d-flex flex-column align-items-center justify-content-center position-relative shadow-sm flex-shrink-0" 
          style={{ width: "150px", height: "150px", ...donutStyle }}
        >
          <div className="rounded-circle d-flex flex-column align-items-center justify-content-center bg-white" style={{ width: "116px", height: "116px" }}>
            <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: "32px", letterSpacing: "-1px" }}>{totalTasks}</h3>
            <span className="text-secondary fw-semibold" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Tasks</span>
          </div>
        </div>

        {/* Right: Premium Legend */}
        <div className="d-flex flex-column gap-4 text-start">
          <div className="lh-sm">
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <div className="rounded-circle bg-success flex-shrink-0" style={{ width: "10px", height: "10px" }}></div>
              <span className="text-secondary fw-medium" style={{ fontSize: "13px" }}>Completed</span>
            </div>
            <div className="fw-bolder text-dark ps-3 ms-1" style={{ fontSize: "14px" }}>
              {completedCount} <span className="text-muted fw-semibold">({completedPercent}%)</span>
            </div>
          </div>

          <div className="lh-sm">
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <div className="rounded-circle flex-shrink-0" style={{ width: "10px", height: "10px", backgroundColor: "#2563eb" }}></div>
              <span className="text-secondary fw-medium" style={{ fontSize: "13px" }}>In Progress</span>
            </div>
            <div className="fw-bolder text-dark ps-3 ms-1" style={{ fontSize: "14px" }}>
              {inProgressCount} <span className="text-muted fw-semibold">({inProgressPercent}%)</span>
            </div>
          </div>

          <div className="lh-sm">
            <div className="d-flex align-items-center gap-2 mb-1.5">
              <div className="rounded-circle flex-shrink-0" style={{ width: "10px", height: "10px", backgroundColor: "#9ca3af" }}></div>
              <span className="text-secondary fw-medium" style={{ fontSize: "13px" }}>To Do</span>
            </div>
            <div className="fw-bolder text-dark ps-3 ms-1" style={{ fontSize: "14px" }}>
              {toDoCount} <span className="text-muted fw-semibold">({toDoPercent}%)</span>
            </div>
          </div>
        </div>
        
      </div>
    </Card>
  );
};