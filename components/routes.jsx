// routes.jsx
import { Routes, Route } from 'react-router-dom';
import ShortenerForm from './ShortenerForm.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ShortenerForm />} />
      <Route path="/log" element={<Login />} />
      <Route path="/dash" element={<Dashboard />} />
    </Routes>
  );
}
