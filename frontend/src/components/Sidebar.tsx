import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const adminLinks = [{ to: '/admin', label: 'Dashboard' }];
const instructorLinks = [{ to: '/instructor', label: 'Dashboard' }];
const studentLinks = [{ to: '/student', label: 'Dashboard' }];

export default function Sidebar() {
  const { user } = useAuth();
  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'instructor'
      ? instructorLinks
      : studentLinks;

  return (
    <nav className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col pt-4 px-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
