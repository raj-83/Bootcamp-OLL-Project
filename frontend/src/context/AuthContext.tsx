// // frontend/src/context/AuthContext.tsx
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// interface AuthContextType {
//   user: any;
//   login: (email: string, password: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
//   logout: () => void;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       console.log('Attempting login with:', email);
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);
      
//       if (!response.ok) throw new Error(data.message);

//       localStorage.setItem('user', JSON.stringify(data));
//       setUser(data);
      
//       // Navigate to appropriate dashboard based on user role (case-insensitive)
//       const role = data.role.toLowerCase();
//       console.log('User role (lowercase):', role);
      
//       if (role === 'student') {
//         navigate('/student/dashboard');
//       } else if (role === 'teacher') {
//         navigate('/mentor/dashboard');
//       } else if (role === 'admin') {
//         navigate('/admin/dashboard');
//       } else {
//         console.error('Unknown role:', data.role);
//       }
      
//       return data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     const response = await fetch('http://localhost:5000/api/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(userData),
//     });

//     const data = await response.json();
//     if (!response.ok) throw new Error(data.message);

//     localStorage.setItem('user', JSON.stringify(data));
//     setUser(data);
//     return data;
//   };

//   const logout = () => {
//     localStorage.removeItem('user');
//     setUser(null);
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



// Enhanced frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAccess: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Optional: Verify token is still valid with your API
        // try {
        //   const response = await fetch('http://localhost:5000/api/auth/verify', {
        //     headers: { Authorization: `Bearer ${userData.token}` }
        //   });
        //   if (!response.ok) {
        //     localStorage.removeItem('user');
        //     setUser(null);
        //   } else {
        //     setUser(userData);
        //   }
        // } catch (error) {
        //   console.error('Token verification failed', error);
        //   localStorage.removeItem('user');
        //   setUser(null);
        // }
        
        setUser(userData);
      }
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      // Navigate to appropriate dashboard based on user role (case-insensitive)
      const role = data.role.toLowerCase();
      
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher' || role === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        console.error('Unknown role:', data.role);
        navigate('/');
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      // Navigate based on role
      const role = data.role.toLowerCase();
      
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher' || role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/');
      }
      
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };
  
  // Helper function to check if user has access to a protected route
  const checkAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    
    // Convert to lowercase for case-insensitive comparison
    const userRole = user.role.toLowerCase();
    return allowedRoles.some(role => role.toLowerCase() === userRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      isAuthenticated: !!user,
      checkAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};