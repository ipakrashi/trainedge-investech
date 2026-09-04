// src/App.jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLayout from './components/common/UserLayout'
import ProtectedRoute from './components/common/protectedRoutes'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LoginUser from './pages/LoginUser'
import Pipeline from './pages/Pipeline'
import Reports from './pages/Reports'
import StudentRoster from './pages/StudentRoster' // <-- NEW Import
import AdminRoute from './components/routing/AdminRoute'
import UserManagement from './pages/admin/UserManagement'
import CourseManagement from './pages/admin/CourseManagement'
import RoleManagement from './pages/admin/RoleManagement'
import ManageSources from './pages/admin/ManageSources'
import ManageStatuses from './pages/admin/ManageStatuses'
import ManageExperiences from './pages/admin/ManageExperiences'
import ReassignLeads from './pages/admin/ReassignLeads'
import PendingStudents from './pages/admin/PendingStudents' // <-- NEW Import

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC ROUTE */}
                <Route path='/login' element={<LoginUser />} />

                {/* PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>
                    {/* The UI Layout (Navbar + Footer) */}
                    <Route path='/' element={<UserLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path='/leads' element={<Leads />} />
                        <Route path='/pipeline' element={<Pipeline />} />
                        <Route path='/reports' element={<Reports />} />
                        <Route
                            path='/students'
                            element={<StudentRoster />}
                        />{' '}
                        {/* <-- NEW Route */}
                        {/* ADMIN ROUTES */}
                        <Route element={<AdminRoute />}>
                            <Route
                                path='/admin/users'
                                element={<UserManagement />}
                            />
                            <Route
                                path='/admin/courses'
                                element={<CourseManagement />}
                            />
                            <Route
                                path='/admin/roles'
                                element={<RoleManagement />}
                            />
                            <Route
                                path='/admin/sources'
                                element={<ManageSources />}
                            />
                            <Route
                                path='/admin/statuses'
                                element={<ManageStatuses />}
                            />
                            <Route
                                path='/admin/experiences'
                                element={<ManageExperiences />}
                            />
                            <Route
                                path='/admin/reassign'
                                element={<ReassignLeads />}
                            />
                            <Route
                                path='/admin/pending-students'
                                element={<PendingStudents />}
                            />{' '}
                            {/* <-- NEW Route */}
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
