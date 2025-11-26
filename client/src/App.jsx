import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CaseList from './components/CaseList';
import CreateCase from './pages/CreateCase';
import CaseDetails from './pages/CaseDetails';
import LegalResearch from './pages/LegalResearch';
import LawyerDirectory from './pages/LawyerDirectory';
import LawyerProfile from './pages/LawyerProfile';
import Marketplace from './pages/Marketplace';
import Chat from './pages/Chat';
import Elections from './pages/Elections';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cases" element={<CaseList />} />
              <Route path="/cases/new" element={<CreateCase />} />
              <Route path="/cases/:id" element={<CaseDetails />} />
              <Route path="/research" element={<LegalResearch />} />
              <Route path="/lawyers" element={<LawyerDirectory />} />
              <Route path="/lawyers/:id" element={<LawyerProfile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
