import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                 element={<HomePage />} />
          <Route path="/catalog"          element={<CatalogPage />} />
          <Route path="/appointments"     element={<AppointmentsPage />} />
          <Route path="/my-appointments"  element={<MyAppointmentsPage />} />
          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
