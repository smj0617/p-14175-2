"use client";

export default function Page() {
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

    // 아직은 입력값을 콘솔에만 찍어 본다 (백엔드 전송은 5-3에서)
    console.log("제목:", titleInput.value);
    console.log("내용:", contentTextarea.value);
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
