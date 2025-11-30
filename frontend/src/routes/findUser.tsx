import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import logoSvg from '../assets/logo.svg'
import searchSvg from '../assets/search.svg'
import { apiRequest } from '../utils/api'

// 검색 결과 타입
type SearchResult = {
  id: string
  name: string
  studentId: string
  admissionYear: string
}

export const Route = createFileRoute('/findUser')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // 검색 API 호출 함수
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const results = await apiRequest<SearchResult[]>(`/users/search?query=${encodeURIComponent(query)}`)
      setSearchResults(results)
    } catch (err) {
      console.error('검색 실패:', err)
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // 검색어가 변경될 때마다 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms 디바운싱

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // 검색 결과 클릭 핸들러
  const handleResultClick = (userId: string) => {
    // 해당 사용자의 트리 페이지로 이동
    // TODO: 사용자 트리 페이지 경로에 맞게 수정 필요
    navigate({ to: `/trees/${userId}` })
  }

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 네비게이션 바 */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          <span className="font-medium">방으로 돌아가기</span>
        </Link>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col gap-[30px] items-center justify-center h-screen bg-white">
        <img src={logoSvg} alt="logo" className="w-[300px] h-auto" />
        
        {/* 검색 입력창 */}
        <div className="w-auto max-w-2xl">
          <div className="flex border-[1px] border-black w-auto gap-[30px] py-[5px] px-[30px] justify-between items-center rounded-[10px] bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="친구의 이름을 입력해주세요. ex) 25 홍길동"
              className="font-semibold text-md text-gray-700 placeholder:text-[#D9D9D9] outline-none border-none bg-transparent"
              style={{ width: '400px' }}
            />
            <img 
              src={searchSvg} 
              alt="search" 
              className="w-[30px] h-auto cursor-pointer" 
              onClick={() => performSearch(searchQuery)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  검색 결과 ({searchResults.length}명)
                </h3>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.id)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-[#835353] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">{result.name}</span>
                          <span className="text-sm text-gray-600">({result.admissionYear}학번)</span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {searchQuery.trim() && !isSearching && searchResults.length === 0 && !error && (
            <div className="mt-6 p-4 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}

          {/* 로딩 중 */}
          {isSearching && (
            <div className="mt-6 p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600 text-sm">검색 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
