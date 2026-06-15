import { Routes, Route } from 'react-router-dom'; // Notice: No "Router" here anymore!
import Sidebar from './components/Sidebar';
import DashboardOverview from './pages/DashboardOverview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Licenses from './pages/Licenses';
import Enterprise from './pages/Enterprise';
import AIChatbot from './components/AIChatbot';
import AdminDashboard from './pages/AdminDashboard';
import AdminLicenses from './pages/AdminLicenses';

function App() {
  const isLoggedIn = !!localStorage.getItem('token'); 

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar /> 
      
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={isLoggedIn ? <DashboardOverview /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/licenses" element={<AdminLicenses />} />
        </Routes>
      </div>
      
      {/* Floating AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export default App;