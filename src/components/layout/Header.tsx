import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 glass border-b flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex-1">
        {/* Placeholder for search or breadcrumbs if needed */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <User size={18} className="text-gray-400" />
          <span>{user?.username || 'Admin'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-gray-800/50"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
