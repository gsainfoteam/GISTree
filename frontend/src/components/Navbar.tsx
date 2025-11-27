import { Link } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-600">
          🎄 GISTree
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/" className="text-gray-600 hover:text-green-600">
                My Tree
              </Link>
              <Link to="/inbox" className="text-gray-600 hover:text-green-600">
                Inbox
              </Link>
              <Link to="/write" className="text-gray-600 hover:text-green-600">
                Write
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-green-600">
                Profile
              </Link>
              <button onClick={logout} className="text-red-500 hover:text-red-700">
                Logout
              </button>
            </>
          ) : (
            <button onClick={login} className="text-green-600 hover:text-green-800 font-semibold">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
