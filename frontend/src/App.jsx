import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home  from './pages/Home';
import JobsPublic from './pages/public/Jobs';
import JobDetails from './pages/public/JobDetails';
import CompaniesPublic from './pages/public/Companies';
import CompanyDetails from './pages/public/CompanyDetails';
import PublicProfile from './pages/public/PublicProfile';
import AuthPage from './pages/Auth/AuthPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChangePassword from './pages/Auth/ChangePassword';
import Profile from './pages/student/Profile';
import MyApplications from './pages/student/MyApplications';
import DashboardLayout from './components/layout/DashboardLayout';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import Companies from './pages/recruiter/Companies';
import ManageCompany from './pages/recruiter/ManageCompany';
import Jobs from './pages/recruiter/Jobs';
import ManageJob from './pages/recruiter/ManageJob';
import Applicants from './pages/recruiter/Applicants';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminUsers from './pages/admin/AdminUsers';
import AdminChatbot from './pages/admin/AdminChatbot';
import SystemLogs from './pages/admin/SystemLogs';
import ActivityLogs from './pages/admin/ActivityLogs';
import LogPolicies from './pages/admin/LogPolicies';
import MyActivity from './pages/user/MyActivity';
import SecurityLogs from './pages/user/SecurityLogs';
import MyInterviews from './pages/shared/MyInterviews';
import ChatPage from './pages/shared/ChatPage';
import { Chatbot } from './components/shared/Chatbot';
import ProtectedRoute from './components/shared/ProtectedRoute';
import SocketNotificationHandler from './components/shared/SocketNotificationHandler';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './redux/slices/userSlice';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

function App() {
   const user = useSelector(selectCurrentUser);
   const isPasswordExpired = useSelector((state) => state.user.isPasswordExpired);

 return (
   <>
       {user && !isPasswordExpired && <SocketNotificationHandler />}
     <Routes>
       <Route path="/" element={<MainLayout />}>
         <Route index element={<Home />} />
         <Route path="jobs" element={<JobsPublic />} />
         <Route path="jobs/:jobId" element={<JobDetails />} />
         <Route path="companies" element={<CompaniesPublic />} />
         <Route path="companies/:companyId" element={<CompanyDetails />} />
         <Route path="public-profile/:userId" element={<PublicProfile />} />
          <Route path="about" element={<About />} />
         <Route path="contact" element={<Contact />} />
       </Route>


       {/* Unified Auth Page with animated transitions */}
       <Route path="/login" element={<AuthPage />} />
       <Route path="/register" element={<AuthPage />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/change-password" element={<ChangePassword />} />

       <Route
         path="/student"
         element={
           <ProtectedRoute allowedRoles={['student']}>
             <MainLayout />
           </ProtectedRoute>
         }
       >
         <Route path="profile" element={<Profile />} />
         <Route path="applications" element={<MyApplications />} />
       </Route>

       <Route
         path="/recruiter"
         element={
           <ProtectedRoute allowedRoles={['recruiter']}>
             <DashboardLayout />
           </ProtectedRoute>
         }
       >
         <Route index element={<RecruiterDashboard />} />
         <Route path="companies" element={<Companies />} />
         <Route path="companies/new" element={<ManageCompany />} />
         <Route path="companies/edit/:companyId" element={<ManageCompany />} />
         <Route path="jobs" element={<Jobs />} />
         <Route path="jobs/new" element={<ManageJob />} />
         <Route path="jobs/edit/:jobId" element={<ManageJob />} />
         <Route path="jobs/:jobId/applicants" element={<Applicants />} />
       </Route>

       <Route
         path="/admin"
         element={
           <ProtectedRoute allowedRoles={['admin']}>
             <DashboardLayout />
           </ProtectedRoute>
         }
       >
         <Route index element={<AdminCompanies />} />
         <Route path="companies" element={<AdminCompanies />} />
         <Route path="users" element={<AdminUsers />} />
         <Route path="chatbot" element={<AdminChatbot />} />
         <Route path="logs" element={<SystemLogs />} />
         <Route path="activity-logs" element={<ActivityLogs />} />
         <Route path="log-policies" element={<LogPolicies />} />
       </Route>

       <Route
         element={
           <ProtectedRoute allowedRoles={['student', 'recruiter']}>
             <MainLayout />
           </ProtectedRoute>
         }
       >
         <Route path="/my-interviews" element={<MyInterviews />} />
       </Route>

           <Route
         element={
           <ProtectedRoute allowedRoles={['student', 'recruiter']}>
             <MainLayout />
           </ProtectedRoute>
         }
       >
        <Route
         path="/chat"
         element={
          
             <ChatPage />
         }
       />
       </Route>

       <Route
         path="/my-activity"
         element={
           <ProtectedRoute>
             <MainLayout>
                <MyActivity />
             </MainLayout>
           </ProtectedRoute>
         }
       />
       
       <Route
         path="/security-logs"
         element={
           <ProtectedRoute>
             <MainLayout>
                <SecurityLogs />
             </MainLayout>
           </ProtectedRoute>
         }
       />

              <Route path="*" element={<NotFound />} />

     </Routes>
     
     {!isPasswordExpired && <Chatbot />}
   </>
 );
}

export default App;