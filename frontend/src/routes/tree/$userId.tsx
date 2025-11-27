import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Tree } from '../../components/Tree'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/tree/$userId')({
  component: TreePage,
})

function TreePage() {
  const { userId } = Route.useParams()
  const { user } = useAuth()
  const [treeData, setTreeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchTree()
    }
  }, [userId])

  const fetchTree = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/trees/${userId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTreeData(data);
      } else if (response.status === 404) {
        setError('Tree not found');
      } else {
        setError('Failed to load tree');
      }
    } catch (error) {
      console.error('Failed to fetch tree', error);
      setError('Failed to load tree');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading tree...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  if (!treeData) {
    return <div className="p-4">Tree not found.</div>
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        {user?.id === userId ? 'My Tree' : 'Friend\'s Tree'}
      </h1>

      <div className="w-full max-w-md aspect-[3/4]">
        <Tree
          userId={userId}
          decorations={treeData.decorations}
          isLocked={treeData.isLocked}
        />
      </div>

      {user?.id === userId && (
        <div className="mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Decorate Tree
          </button>
        </div>
      )}
    </div>
  )
}
