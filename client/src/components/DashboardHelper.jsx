import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {Navigate} from 'react-router-dom';

// Import actual dashboards (we will create these next)
// For now, we return placeholders inline or simplistic components
import VisitorDashboard from '../pages/dashboards/VisitorDashboard';
import HostDashboard from '../pages/dashboards/HostDashboard';
import SecurityDashboard from '../pages/dashboards/SecurityDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import StudentDashboard from '../pages/dashboards/StudentDashboard';

const DashboardHelper = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'visitor':
            return <VisitorDashboard />;
        case 'host':
        case 'faculty':
            return <HostDashboard />;
        case 'security':
            return <SecurityDashboard />;
        case 'admin':
            return <AdminDashboard />;
        case 'student':
            return <StudentDashboard />;
        default:
            return <div>Unknown Role</div>;
    }
};

export default DashboardHelper;
