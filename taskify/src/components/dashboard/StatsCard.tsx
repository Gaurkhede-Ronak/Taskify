import { Card, Badge, ProgressBar } from "react-bootstrap";

interface StatsCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  badgeVariant?: "success" | "primary" | "warning" | "danger" | "info";
  progress?: number;
  progressVariant?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
  borderColor?: string;
}

export const StatsCard = ({
  title,
  value,
  badgeText,
  badgeVariant = "success",
  progress,
  progressVariant = "primary",
  icon,
  borderColor = "#4f46e5",
}: StatsCardProps) => {


  const isHex = borderColor.startsWith("#") && (borderColor.length === 7 || borderColor.length === 4);
  const iconBg = isHex ? `${borderColor}1A` : "#f8fafc"; 

  return (
    <Card 

      className="border-0 bg-white h-100 d-flex flex-column p-3 p-md-4" 
      style={{ 
        borderRadius: "20px", 
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", 
      }}
    >
      {/* Top Row: Title & Icon */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span 
          className="text-secondary fw-bold text-uppercase text-truncate pe-2" 
          style={{ fontSize: "11px", letterSpacing: "0.5px" }}
          title={title}
        >
          {title}
        </span>
        {icon && (
          <div 
            className="d-flex align-items-center justify-content-center flex-shrink-0" 
            style={{ 
              width: "36px", 
              height: "36px", 
              backgroundColor: iconBg, 
              color: borderColor,
              borderRadius: "10px" 
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Middle Row: Value & Badge */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-1 gap-2">
        <h3 
          className="fw-bolder mb-0 text-dark" 
          style={{ 
  
            fontSize: "clamp(22px, 3vw, 34px)", 
            letterSpacing: "-1px", 
            lineHeight: "1" 
          }}
        >
          {value}
        </h3>
        {badgeText && (
          <Badge 
            bg={badgeVariant} 
            className={`bg-opacity-10 text-${badgeVariant} fw-bold px-2 py-1 rounded-pill`} 
            style={{ fontSize: "11px" }}
          >
            {badgeText}
          </Badge>
        )}
      </div>

      {/* Bottom Row: Progress Bar (Sticks to bottom) */}
      {progress !== undefined && (
        <div className="mt-auto pt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-secondary fw-medium" style={{ fontSize: "11px" }}>Progress</span>
            <span className="text-dark fw-bold" style={{ fontSize: "11px" }}>{progress}%</span>
          </div>
          <ProgressBar 
            now={progress} 
            variant={progressVariant}
            style={{ height: "5px", backgroundColor: "#f1f5f9" }} 
            className="rounded-pill border-0" 
          />
        </div>
      )}
    </Card>
  );
};