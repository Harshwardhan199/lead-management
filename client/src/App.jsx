import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import PublicLeadPage from "./pages/PublicLeadPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadDetailsPage from "./pages/LeadDetailsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#E7E4D8] flex flex-col font-sans antialiased text-[#161D18] selection:bg-[#2A4B3A] selection:text-white">
          <Navbar />
          <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto lg:overflow-hidden">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLeadPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/leads/:id" element={<LeadDetailsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
