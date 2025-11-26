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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
