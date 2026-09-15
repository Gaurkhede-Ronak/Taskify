import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../src/redux/store"; 

import AuthLayout from "../components/layout/AuthLayout";
import UILayout from "../components/layout/UlLayout"; 
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProfileSettings from "../pages/ProfileSettings";
import { Projects } from "../pages/Projects"; 
import { Tasks } from "../pages/Tasks";
import ProjectDetails from "../pages/ProjectDetails";
import { TaskDetails } from "../pages/TaskDetails";
import Calendar from "../pages/Calendar";
import Notifications from "../pages/Notifications";

const Router = () => {

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<UILayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/projects"
              element={<Projects />}
            />
            <Route
              path="/projects/:projectId"
              element={<ProjectDetails />}
            />
            <Route
              path="/tasks"
              element={<Tasks />}
            />
            <Route
              path="/tasks/:id"
              element={<TaskDetails />}
            />
            
            <Route
              path="/calendar"
              element={<Calendar />}
            />

            <Route path="/notification" 
            element={<Notifications />} />

            <Route
              path="/profile"
              element={<ProfileSettings />}
            />
            <Route
              path="/settings"
              element={<Navigate to="/profile" replace />}
            />
          </Route>
        </Route>


        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"} 
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default Router;