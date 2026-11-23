const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 백엔드 호출 공용 함수: 주소 앞부분 붙이기 + 응답을 JSON으로 바꾸기
export const apiFetch = (url: string, options?: RequestInit) => {
  return fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, options).then((res) =>
    res.json(),
  );
};
