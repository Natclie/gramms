import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}