import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Tree } from '../../components/Tree'
import { useAuth } from '../../context/AuthContext'
import { getApiUrl } from '../../config'

export const Route = createFileRoute('/tree/$userId')({
  component: TreePage,
})

function TreePage() {
  const { userId } = Route.useParams()
  const { user } = useAuth()
  const [treeData, setTreeData] = useState<any>(null)
  const [allOrnaments, setAllOrnaments] = useState<any[]>([])
  const [myOrnaments, setMyOrnaments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [userId, user])

  const fetchData = async () => {
    try {
      const apiUrl = getApiUrl();

      // Fetch Tree, All Ornaments, and My Ornaments (if logged in)
      const promises = [
        fetch(`${apiUrl}/trees/${userId}`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
        fetch(`${apiUrl}/ornaments`, { credentials: 'include' }).then(res => res.ok ? res.json() : []),
      ];

      if (user && user.id === userId) {
        promises.push(
          fetch(`${apiUrl}/ornaments/my`, { credentials: 'include' }).then(res => res.ok ? res.json() : [])
        );
      }

      const [tree, all, my] = await Promise.all(promises);

      if (!tree) {
        setError('Tree not found');
      } else {
        setTreeData(tree);
        setAllOrnaments(all);
        if (my) {
          // myOrnaments returns UserOrnament[], map to Ornament
          setMyOrnaments(my.map((uo: any) => uo.ornament));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setError('Failed to load tree data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTree = async (newDecorations: any) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/trees/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ decorations: newDecorations }),
      });

      if (response.ok) {
        alert('Tree saved successfully!');
        // Refresh tree data
        const updatedTree = await response.json();
        setTreeData(updatedTree);
      } else {
        alert('Failed to save tree.');
      }
    } catch (error) {
      console.error('Failed to save tree', error);
      alert('Failed to save tree.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center">{error}</div>
  }

  if (!treeData) {
    return <div className="p-4 text-center">Tree not found.</div>
  }

  const isMyTree = user?.id === userId;

  return (
    <div className="p-4 flex flex-col items-center min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        {isMyTree ? 'My Christmas Tree 🎄' : 'Friend\'s Tree 🎄'}
      </h1>

      <div className="w-full max-w-md">
        <Tree
          userId={userId}
          decorations={treeData.decorations}
          isLocked={treeData.isLocked}
          isEditable={isMyTree}
          inventory={myOrnaments}
          allOrnaments={allOrnaments}
          onSave={handleSaveTree}
        />
      </div>

      {!isMyTree && (
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">Want to send a message and hang an ornament?</p>
          <a href="/write" className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg">
            Send Message
          </a>
        </div>
      )}
    </div>
  )
}
