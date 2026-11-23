const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 백엔드 호출 공용 함수: 주소 앞부분 붙이기 + 응답을 JSON으로 바꾸기
export const apiFetch = (url: string, options?: RequestInit) => {
  return fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, options).then((res) => {
    // 상태 코드가 200번대가 아니면(404, 400 등) 실패로 처리
    if (!res.ok) {
      // 백엔드가 보낸 { resultCode, msg } 를 에러로 던진다 → 부르는 쪽 .catch 로 전달됨
      return res.json().then((errorData) => {
        throw errorData;
      });
    }

    return res.json();
  });
};
