import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiAlignLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getTasks } from "../redux/tasks/taskSlice"; 
import { fetchProjects } from "../redux/slices/projectSlice"; 

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  itemType: string;
  time: string;
  desc: string;
}

export const Calendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const taskState = useSelector((state: RootState) => state.tasks);
  const projectState = useSelector((state: RootState) => state.projects);

  const tasks = (taskState as any)?.tasks || (taskState as any)?.data || (Array.isArray(taskState) ? taskState : []);
  const projects = (projectState as any)?.projects || (projectState as any)?.data || (Array.isArray(projectState) ? projectState : []);

  const [currentDate, setCurrentDate] = useState<Date>(new Date()); 
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const daysOfWeek: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const year: number = currentDate.getFullYear();
  const month: number = currentDate.getMonth();
  const daysInMonth: number = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth: number = new Date(year, month, 1).getDay();

  const blanks: unknown[] = Array.from({ length: firstDayOfMonth });
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName: string = currentDate.toLocaleString("default", { month: "long" });

  useEffect(() => {
    dispatch(getTasks());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handlePrevMonth = (): void => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = (): void => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForMonth = (): Record<number, CalendarEvent[]> => {
    const events: Record<number, CalendarEvent[]> = {};
    
    const processItems = (items: any[], itemType: string, typeColor: string) => {
      if (!Array.isArray(items)) return;

      items.forEach((item: any) => {
        const targetDate = item.dueDate || item.endDate || item.deadline || item.startDate || item.createdAt; 
        if (!targetDate) return;
        
        const itemDate = new Date(targetDate);
        if (itemDate.getMonth() === month && itemDate.getFullYear() === year) {
          const day = itemDate.getDate();
          if (!events[day]) events[day] = [];

          events[day].push({
            id: item._id || item.id,
            title: item.taskName || item.projectName || item.name || item.title || `Untitled ${itemType}`,
            type: typeColor,
            itemType: itemType,
            time: "All Day", 
            desc: item.description || `No description provided for this ${itemType}.`
          });
        }
      });
    };

 
    processItems(projects, "Project", "success");
    processItems(tasks, "Task", "danger");

    return events;
  };

  const monthEvents = getEventsForMonth();

  const handleEventClick = (event: CalendarEvent, day: number): void => {
    setSelectedEvent({ ...event, day, month: monthName, year });
    setShowModal(true);
  };

  return (
    <div className="w-100 p-2 p-sm-3 p-md-4 p-xl-5" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      
      <style>{`
        .calendar-wrapper { border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05); background-color: #ffffff; overflow: hidden; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #f1f5f9; gap: 1px; border-top: 1px solid #f1f5f9; }
        .calendar-day-header { background-color: #ffffff; text-align: center; padding: 8px 0; font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .calendar-cell { background-color: #ffffff; min-height: 85px; padding: 4px; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 4px; position: relative; }
        .calendar-cell:hover { background-color: #f8fafc; cursor: pointer; }
        .calendar-cell.blank { background-color: #fafbfc; color: #cbd5e1; pointer-events: none; }
        .date-number { display: inline-flex; justify-content: center; align-items: center; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 2px; align-self: flex-end; transition: all 0.2s ease; }
        
        /* Today Date - Blue */
        .date-number.today { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); }
        
        .event-pill { font-size: 9.5px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.2s ease; border: 1px solid transparent; border-left-width: 3px; }
        .event-pill:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); filter: brightness(0.95); }
        
        /* Custom Pill Colors (Green for Project, Red for Task) */
        .event-success { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; border-left-color: #22c55e; }
        .event-danger { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; border-left-color: #ef4444; }

        .nav-btn { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s ease; }
        .nav-btn:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
        .premium-modal .modal-content { border-radius: 20px; border: none; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .icon-box { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

        @media (min-width: 768px) {
          .calendar-wrapper { border-radius: 20px; }
          .calendar-cell { min-height: 120px; padding: 8px; gap: 6px; }
          .date-number { font-size: 14px; width: 28px; height: 28px; margin-bottom: 4px; }
          .calendar-day-header { font-size: 12px; padding: 12px 0; letter-spacing: 0.8px; }
          .event-pill { font-size: 11px; padding: 4px 8px; border-radius: 6px; border-left-width: 4px; }
          .nav-btn { width: 42px; height: 42px; }
        }

        @media (min-width: 1200px) {
          .calendar-cell { min-height: 140px; padding: 10px; }
          .event-pill { font-size: 11.5px; padding: 5px 10px; border-radius: 8px; }
        }
      `}</style>

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1" style={{ letterSpacing: "-0.5px", fontSize: "24px" }}>Calendar</h2>
          <p className="text-secondary mb-0" style={{ fontSize: "14px" }}>Track your tasks and project deadlines.</p>
        </div>
        
        {/* Legend (Project = Green, Task = Red) */}
        <div className="d-flex align-items-center gap-4 bg-white px-4 py-2 rounded-pill border shadow-sm" style={{ borderColor: "#e2e8f0" }}>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle shadow-sm" style={{ width: "12px", height: "12px", backgroundColor: "#22c55e" }}></span>
            <span className="fw-bold text-secondary" style={{ fontSize: "14px", letterSpacing: "0.3px" }}>Project</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle shadow-sm" style={{ width: "12px", height: "12px", backgroundColor: "#ef4444" }}></span>
            <span className="fw-bold text-secondary" style={{ fontSize: "14px", letterSpacing: "0.3px" }}>Task</span>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="calendar-wrapper">
        <div className="d-flex justify-content-center align-items-center p-3 p-md-4 bg-white border-bottom border-light-subtle">
          <div className="d-flex align-items-center gap-3">
            <button onClick={handlePrevMonth} className="nav-btn shadow-sm flex-shrink-0"><FiChevronLeft size={22} /></button>
            <h4 className="fw-bolder text-dark mb-0 m-0 text-center text-truncate" style={{ flex: 1, minWidth: "160px", fontSize: "18px" }}>
              {monthName} {year}
            </h4>
            <button onClick={handleNextMonth} className="nav-btn shadow-sm flex-shrink-0"><FiChevronRight size={22} /></button>
          </div>
        </div>

        <div className="calendar-grid bg-white border-0">
          {daysOfWeek.map((day: string, index: number) => <div key={index} className="calendar-day-header">{day}</div>)}
        </div>

        <div className="calendar-grid">
          {blanks.map((_, index: number) => <div key={`blank-${index}`} className="calendar-cell blank"></div>)}

          {days.map((day: number) => {
            const today = new Date();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayEvents = monthEvents[day] || [];

            return (
              <div key={day} className="calendar-cell">
                <span className={`date-number ${isToday ? 'today' : ''}`}>{day}</span>
                {dayEvents.map((event: CalendarEvent, idx: number) => (
                  <div 
                    key={idx} 
                    className={`event-pill event-${event.type}`}
                    onClick={() => handleEventClick(event, day)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Event Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" dialogClassName="premium-modal">
        <Modal.Header closeButton className="border-0 pb-0 pt-3 pt-md-4 px-3 px-md-5">
          <div className={`badge bg-${selectedEvent?.type} bg-opacity-10 text-${selectedEvent?.type} px-3 py-2 rounded-pill fw-bolder text-uppercase`} style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            {selectedEvent?.itemType}
          </div>
        </Modal.Header>
        <Modal.Body className="px-3 px-md-5 pb-3 pb-md-4 pt-3">
          {selectedEvent && (
            <>
              <h3 className="fw-bolder text-dark mb-4" style={{ letterSpacing: "-0.5px", fontSize: "22px" }}>{selectedEvent.title}</h3>
              
              <div className="d-flex flex-column gap-3 gap-md-4 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className={`icon-box bg-${selectedEvent.type} bg-opacity-10 text-${selectedEvent.type} flex-shrink-0`}>
                    <FiCalendar size={18} />
                  </div>
                  <div>
                    <div className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "10.5px", letterSpacing: "0.5px" }}>Due Date</div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "14px" }}>{selectedEvent.day} {selectedEvent.month} {selectedEvent.year}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className={`icon-box bg-${selectedEvent.type} bg-opacity-10 text-${selectedEvent.type} flex-shrink-0`}>
                    <FiClock size={18} />
                  </div>
                  <div>
                    <div className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "10.5px", letterSpacing: "0.5px" }}>Time</div>
                    <div className="fw-semibold text-dark" style={{ fontSize: "14px" }}>{selectedEvent.time}</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 mt-1">
                  <div className={`icon-box bg-${selectedEvent.type} bg-opacity-10 text-${selectedEvent.type} flex-shrink-0`}>
                    <FiAlignLeft size={18} />
                  </div>
                  <div>
                    <div className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "10.5px", letterSpacing: "0.5px" }}>Description</div>
                    <div className="text-secondary" style={{ fontSize: "14px", lineHeight: "1.5" }}>{selectedEvent.desc}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3 pb-md-5 px-3 px-md-5 d-flex flex-column flex-sm-row gap-2 justify-content-sm-end">
          <Button variant="light" className="rounded-pill fw-bold shadow-sm px-4 py-2 w-100" onClick={() => setShowModal(false)} style={{ color: "#64748b" }}>Close</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Calendar;