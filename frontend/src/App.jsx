import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import PublicSearch from './pages/PublicSearch';

// Layouts and Protected Routes
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserLayout from './components/layouts/UserLayout';
import BloodBankLayout from './components/layouts/BloodBankLayout';
import TestLabLayout from './components/layouts/TestLabLayout';

// User Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import SearchBlood from './pages/user/SearchBlood';
import DonateBlood from './pages/user/DonateBlood';
import EmergencyRequests from './pages/user/EmergencyRequests';
import UserNotifications from './pages/user/UserNotifications';
import UserSettings from './pages/user/UserSettings';
import TestLabs from './pages/user/TestLabs';
import MyTestRequests from './pages/user/MyTestRequests';

// Blood Bank Dashboard Pages
import BloodBankDashboard from './pages/blood-bank/BloodBankDashboard';
import ManageStock from './pages/blood-bank/ManageStock';
import DonorRecords from './pages/blood-bank/DonorRecords';
import BloodBankRequests from './pages/blood-bank/BloodBankRequests';
import Reports from './pages/blood-bank/Reports';
import BloodBankNotifications from './pages/blood-bank/BloodBankNotifications';
import BloodBankSettings from './pages/blood-bank/BloodBankSettings';

// Test Lab Pages
import TestLabDashboard from './pages/test-lab/TestLabDashboard';
import AvailableTests from './pages/test-lab/AvailableTests';
import TestRequests from './pages/test-lab/TestRequests';
import GenerateBill from './pages/test-lab/GenerateBill';
import PatientRecords from './pages/test-lab/PatientRecords';
import TestLabNotifications from './pages/test-lab/TestLabNotifications';
import TestLabSettings from './pages/test-lab/TestLabSettings';
import ProcessTests from './pages/test-lab/ProcessTests';


function App() {
  return (
    <Router>
      <Routes>
        {/* Route accessible to everyone */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search-donors" element={<PublicSearch />} />

        {/* --- Public Routes (Only for logged-out users) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* This route is part of the registration flow */}
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* --- Protected Routes --- */}

        {/* User Role Routes */}
        <Route element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="search" element={<SearchBlood />} />
            <Route path="donate" element={<DonateBlood />} />
            <Route path="emergency" element={<EmergencyRequests />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="test-labs" element={<TestLabs />} />
            <Route path="my-test-requests" element={<MyTestRequests />} />
          </Route>
        </Route>

        {/* Blood Bank Role Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Blood Bank']} />}>
          <Route path="/blood-bank" element={<BloodBankLayout />}>
            <Route index element={<BloodBankDashboard />} />
            <Route path="dashboard" element={<BloodBankDashboard />} />
            <Route path="stock" element={<ManageStock />} />
            <Route path="donors" element={<DonorRecords />} />
            <Route path="requests" element={<BloodBankRequests />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<BloodBankNotifications />} />
            <Route path="settings" element={<BloodBankSettings />} />
          </Route>
        </Route>

        {/* Test Lab Role Routes (Corrected Structure) */}
        <Route element={<ProtectedRoute allowedRoles={['Test Lab']} />}>
          <Route path="/test-lab" element={<TestLabLayout />}>
            <Route index element={<TestLabDashboard />} />
            <Route path="dashboard" element={<TestLabDashboard />} />
            <Route path="tests" element={<AvailableTests />} />
            <Route path="requests" element={<TestRequests />} />
            <Route path="prescription" element={<GenerateBill />} />
            <Route path="records" element={<PatientRecords />} />
            <Route path="notifications" element={<TestLabNotifications />} />
            <Route path="settings" element={<TestLabSettings />} />
            <Route path="process" element={<ProcessTests />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;