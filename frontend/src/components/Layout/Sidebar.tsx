import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  ChevronDown, 
  Trophy, 
  User, 
  Gift, 
  BarChart3, 
  Stars,
  BookOpen,
  Users,
  Settings,
  CheckSquare,
  Calendar,
  DollarSign,
  Video,
  PieChart,
  School,
  Briefcase,
  Layers,
  UserCog,
  GraduationCap,
  MessageSquare,
  LogOut
} from 'lucide-react';

const roleBasedNavItems = {
  student: [
    { to: '/student/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/student/tasks', icon: <CheckSquare size={18} />, label: 'Tasks' },
    { to: '/student/sessions', icon: <Video size={18} />, label: 'Sessions' },
    { to: '/student/sales', icon: <DollarSign size={18} />, label: 'Sales' },
    { to: '/student/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
    { to: '/student/feedback', icon: <MessageSquare size={18} />, label: 'Feedback' },
    { to: '/student/help', icon: <UserCog size={18} />, label: 'Help & Support' },
    { to: '/student/profile', icon: <User size={18} />, label: 'My Profile' },
  ],
  teacher: [
    { to: '/mentor/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/mentor/batches', icon: <Briefcase size={18} />, label: 'Batches' },
    { to: '/mentor/sessions', icon: <Video size={18} />, label: 'Sessions' },
    { to: '/mentor/earnings', icon: <DollarSign size={18} />, label: 'Earnings' },
    { to: '/mentor/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
    { to: '/mentor/profile', icon: <User size={18} />, label: 'My Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/admin/batches', icon: <Briefcase size={18} />, label: 'Batches' },
    { to: '/admin/students', icon: <GraduationCap size={18} />, label: 'Students' },
    { to: '/admin/teachers', icon: <School size={18} />, label: 'Teachers' },
    { to: '/admin/earnings', icon: <DollarSign size={18} />, label: 'Earnings' },
    { to: '/admin/feedback', icon: <MessageSquare size={18} />, label: 'Feedback' },
    { to: '/admin/profile', icon: <User size={18} />, label: 'My Profile' },
  ],
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null);
  const [userInitials, setUserInitials] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };
  
  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };
  
  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };
  
  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo({
          name: parsedUser.name || '',
          role: parsedUser.role?.toLowerCase() || 'student' // Default to student if role is missing
        });
        
        // Generate initials from user name
        if (parsedUser.name) {
          const names = parsedUser.name.split(' ');
          const initials = names.length > 1 
            ? `${names[0][0]}${names[1][0]}` 
            : names[0].substring(0, 2);
          setUserInitials(initials.toUpperCase());
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUserInfo({ name: 'User', role: 'student' });
        setUserInitials('U');
      }
    }
  }, []);

  // Determine which navigation items to show based on user role
  const getUserNavItems = () => {
    if (!userInfo?.role) return [];
    
    const role = userInfo.role.toLowerCase();
    
    // Map role to the appropriate navigation items
    if (role === 'admin') {
      return roleBasedNavItems.admin;
    } else if (role === 'teacher') {
      return roleBasedNavItems.teacher;
    } else {
      return roleBasedNavItems.student; // Default to student
    }
  };
  
  const navItems = getUserNavItems();

  return (
    <div className="h-full w-72 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <Stars size={28} className="text-white" />
        <h1 className="text-xl font-bold">Bootcamp Portal</h1>
      </div>

      {/* Navigation */}
      <div className="px-3 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "nav-link",
                location.pathname === item.to && "active"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User profile */}
      <div className="border-t border-sidebar-border/30 p-4 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-accent-foreground font-medium">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userInfo?.name || 'User'}</p>
            <p className="text-xs opacity-70 truncate capitalize">{userInfo?.role || 'user'}</p>
          </div>
          <button 
            onClick={openLogoutModal}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      {showLogoutModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to logout from your account?</p>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={closeLogoutModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                handleLogout();
                closeLogoutModal();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Sidebar;