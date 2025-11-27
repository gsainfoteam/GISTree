import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          🎄 GISTree
        </Link>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/" className="text-slate-600 hover:text-green-600 font-medium transition-colors">
                My Tree
              </Link>
              <Link to="/inbox" className="text-slate-600 hover:text-green-600 font-medium transition-colors">
                Inbox
              </Link>
              <Link to="/write" className="text-slate-600 hover:text-green-600 font-medium transition-colors">
                Write
              </Link>
              <Link to="/profile" className="text-slate-600 hover:text-green-600 font-medium transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 rounded-full transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
