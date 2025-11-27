import { useState } from 'react';

interface User {
  id: string;
  name: string;
  studentId: string;
  admissionYear: string;
}

interface UserSearchProps {
  onSelect: (user: User) => void;
}

export function UserSearch({ onSelect }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/users/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or student ID"
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      <ul className="bg-white border rounded shadow-sm">
        {results.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelect(user)}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-500 text-sm ml-2">({user.admissionYear}학번)</span>
            </div>
            <span className="text-gray-500 text-sm">{user.studentId}</span>
          </li>
        ))}
        {results.length === 0 && query && !isLoading && (
          <li className="p-3 text-gray-500 text-center">No users found</li>
        )}
      </ul>
    </div>
  );
}
