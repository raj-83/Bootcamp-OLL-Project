
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  MessageSquare
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
  mentor: [
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
  // For demo purposes, we'll use a state to toggle between roles
  // In a real app, this would come from auth context
  const [role, setRole] = React.useState<'student' | 'mentor' | 'admin'>('student');
  
  const handleRoleChange = (newRole: 'student' | 'mentor' | 'admin') => {
    setRole(newRole);
  };

  return (
    <div className="h-full w-72 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <Stars size={28} className="text-white" />
        <h1 className="text-xl font-bold">Bootcamp Portal</h1>
      </div>

      {/* Role selector - just for demo */}
      <div className="px-4 mb-6">
        <div className="bg-sidebar-accent rounded-md p-2">
          <div className="text-sidebar-accent-foreground text-sm font-medium mb-2 flex items-center gap-1">
            <User size={14} />
            <span>Switch Role</span>
          </div>
          <div className="flex gap-1">
            {(['student', 'mentor', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={cn(
                  "flex-1 py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors",
                  role === r 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "bg-transparent text-sidebar-accent-foreground hover:bg-sidebar-primary/10"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {roleBasedNavItems[role].map((item) => (
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
            <span className="text-sidebar-accent-foreground font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs opacity-70 truncate capitalize">{role}</p>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
