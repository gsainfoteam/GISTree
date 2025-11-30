/**
 * API 유틸리티 함수들
 * 
 * 이 파일은 백엔드 API와 통신하기 위한 공통 함수들을 모아둡니다.
 */

/**
 * 백엔드 API의 기본 URL을 가져옵니다
 * 환경 변수에 VITE_API_BASE_URL이 설정되어 있으면 그것을 사용하고,
 * 없으면 기본값으로 localhost:3000을 사용합니다.
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
};

/**
 * localStorage에서 저장된 access_token을 가져옵니다
 * 로그인할 때 저장된 토큰을 읽어올 때 사용합니다.
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * access_token을 localStorage에 저장합니다
 * 로그인 성공 후 토큰을 저장할 때 사용합니다.
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

/**
 * localStorage에서 access_token을 삭제합니다
 * 로그아웃할 때 사용합니다.
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem('access_token');
};

/**
 * 백엔드 API에 요청을 보내는 공통 함수입니다
 * 
 * @param endpoint - API 엔드포인트 (예: '/users/me')
 * @param options - fetch 옵션 (GET, POST 등)
 * @returns API 응답 데이터
 * 
 * 사용 예시:
 * const userData = await apiRequest('/users/me');
 * const treeData = await apiRequest('/trees/123');
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // 1. API 기본 URL 가져오기
  const apiUrl = getApiUrl();

  // 2. 저장된 토큰 가져오기
  const token = getAccessToken();

  // 3. 요청 헤더 설정
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 4. 토큰이 있으면 Authorization 헤더에 추가
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  // 5. API 요청 보내기
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 쿠키도 함께 전송
  });

  // 6. 응답이 실패했을 때 처리
  if (!response.ok) {
    // 401 (인증 실패)이면 토큰 삭제하고 에러 발생
    if (response.status === 401) {
      removeAccessToken();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(`API 요청 실패: ${response.statusText}`);
  }

  // 7. 성공하면 JSON 데이터 반환
  return response.json();
};

