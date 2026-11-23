"use client";

import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  // 폼의 "저장" 버튼을 누르면(= 폼 제출) 실행
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    // 브라우저 기본 동작(페이지 새로고침하며 전송)을 막는다
    e.preventDefault();

    // 이벤트가 걸린 <form> 요소
    const form = e.currentTarget;

    // name 속성으로 입력칸 찾기
    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    // 앞뒤 공백 제거 ("  안녕  " → "안녕")
    titleInput.value = titleInput.value.trim();

    if (titleInput.value.length === 0) {
      alert("제목을 입력해주세요.");
      titleInput.focus(); // 문제가 있는 칸으로 커서 이동
      return; // 여기서 멈춤 (아래 코드 실행 안 함)
    }

    if (titleInput.value.length < 2) {
      alert("제목을 2자 이상 입력해주세요.");
      titleInput.focus();
      return;
    }

    contentTextarea.value = contentTextarea.value.trim();

    if (contentTextarea.value.length === 0) {
      alert("내용을 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    if (contentTextarea.value.length < 2) {
      alert("내용을 2자 이상 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    // 검사를 모두 통과했을 때만 여기까지 온다 → 백엔드에 저장 요청
    apiFetch(`/api/v1/posts`, {
      method: "POST",
      // 자바스크립트 객체 → JSON 문자열
      body: JSON.stringify({
        title: titleInput.value,
        content: contentTextarea.value,
      }),
    })
      .then((data) => {
        alert(data.msg);

        // 방금 만든 글의 상세 페이지로 이동 (응답 data.data 가 새 글)
        router.replace(`/posts/${data.data.id}`);
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  return (
    <>
      <h1>글쓰기</h1>

      <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded"
          type="text"
          name="title"
          placeholder="제목"
          maxLength={100}
        />
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="내용"
          maxLength={5000}
          rows={10}
        />
        <button className="border p-2 rounded" type="submit">
          저장
        </button>
      </form>
    </>
  );
}
