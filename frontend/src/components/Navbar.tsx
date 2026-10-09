import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const roleBadge: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    instructor: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <span className="font-bold text-gray-800 text-sm tracking-tight">Education Analytics</span>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadge[user.role] ?? ''}`}>
              {user.role}
            </span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors ml-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
