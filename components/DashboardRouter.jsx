import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";

export default function DashboardRouter() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}