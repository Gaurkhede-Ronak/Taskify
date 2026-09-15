import { Card, Row, Col } from "react-bootstrap";
import { FaCheckCircle, FaBriefcase } from "react-icons/fa";

interface UpcomingTask {
  title: string;
  project: string;
  timeText: string;
  timeColor: string;
  iconBg: string;
  iconColor: string;
  taskIcon?: React.ReactNode;
}

interface ActivityItem {
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  taskIcon?: React.ReactNode;
  assigneeInitial?: string;
}

interface ActivityListProps {
  upcomingTasks: UpcomingTask[];
  recentActivities: ActivityItem[];
}

export const ActivityList = ({
  upcomingTasks,
  recentActivities,
}: ActivityListProps) => {
  return (
    <Row className="g-4">

      {/* ================= UPCOMING TASKS ================= */}
      <Col xs={12} lg={6}>
        <Card
          className="border-0 rounded-4 p-4 bg-white h-100 d-flex flex-column"
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h6
            className="fw-bold mb-4 text-dark"
            style={{ fontSize: "15px" }}
          >
            Upcoming Tasks
          </h6>

          <div className="d-flex flex-column gap-4 flex-grow-1">
            {upcomingTasks.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 py-4">

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "58px",
                    height: "58px",
                    color: "#10b981",
                    backgroundColor: "#ecfdf5",
                  }}
                >
                  <FaCheckCircle size={28} />
                </div>

                <h6
                  className="fw-bold text-dark mb-1"
                  style={{ fontSize: "14px" }}
                >
                  All caught up!
                </h6>

                <span
                  className="text-secondary"
                  style={{ fontSize: "12px" }}
                >
                  You have no upcoming tasks.
                </span>
              </div>
            ) : (
              upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-3">

                  {/* ================= TASK ICON ================= */}
<div
  className="d-flex align-items-center justify-content-center flex-shrink-0"
  style={{
    width: "40px",
    height: "40px",
    backgroundColor: "#f59e0b",
    borderRadius: "14px",
    color: "#ffffff",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.12)",
  }}
>
  {task.taskIcon || <FaBriefcase size={19} />}
</div>

                    {/* ================= TASK DETAILS ================= */}
                    <div className="lh-sm">
                      <h6
                        className="fw-bold mb-1 text-dark"
                        style={{ fontSize: "13px" }}
                      >
                        {task.title}
                      </h6>

                      <span
                        className="text-secondary"
                        style={{ fontSize: "11px" }}
                      >
                        {task.project}
                      </span>
                    </div>

                  </div>

                  {/* ================= TIME ================= */}
                  {task.timeText && (
                    <span
                      className="fw-semibold"
                      style={{
                        fontSize: "11px",
                        color: task.timeColor,
                      }}
                    >
                      {task.timeText}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </Col>

      {/* ================= RECENT ACTIVITY ================= */}
      <Col xs={12} lg={6}>
        <Card
          className="border-0 rounded-4 p-4 bg-white h-100 d-flex flex-column"
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h6
            className="fw-bold mb-4 text-dark"
            style={{ fontSize: "15px" }}
          >
            Recent Activity
          </h6>

          <div className="d-flex flex-column gap-4">
            {recentActivities.map((act, index) => (
              <div
                key={index}
                className="d-flex align-items-start gap-3"
              >
                <div
                  className="position-relative flex-shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                  }}
                  aria-label={`${act.user} task icon`}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: "36px",
                      height: "36px",
                      backgroundColor: "#8254ed",
                      fontSize: "14px",
                    }}
                  >
                    {act.avatar.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="lh-sm mt-1">
                  <p
                    className="mb-1 text-dark"
                    style={{ fontSize: "12px" }}
                  >
                    <strong className="fw-bold">
                      {act.user}
                    </strong>{" "}
                    {act.action}{" "}
                    <span className="text-secondary">
                      "{act.target}"
                    </span>
                  </p>

                  <span
                    className="text-secondary"
                    style={{ fontSize: "10px" }}
                  >
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Col>

    </Row>
  );
};