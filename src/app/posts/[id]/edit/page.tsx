"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostDto } from "@/type/post";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const [post, setPost] = useState<PostDto | null>(null);

  // 수정할 글의 현재 내용을 불러온다 (상세 페이지와 같은 방법)
  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, [id]);

  // 글을 받아오기 전에는 폼을 그리지 않는다 (defaultValue가 비어 버리므로)
  if (post == null) return <div>로딩중...</div>;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    // 입력 검사 (5-2 글쓰기와 같은 규칙)
    titleInput.value = titleInput.value.trim();

    if (titleInput.value.length === 0) {
      alert("제목을 입력해주세요.");
      titleInput.focus();
      return;
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

    // 수정은 PUT, 주소에 어떤 글인지(id)가 들어간다
    apiFetch(`/api/v1/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: titleInput.value,
        content: contentTextarea.value,
      }),
    })
      .then((data) => {
        alert(data.msg);

        // 수정한 글의 상세 페이지로 돌아간다
        router.replace(`/posts/${id}`);
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  return (
    <>
      <h1>{id}번 글 수정</h1>

      <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded"
          type="text"
          name="title"
          placeholder="제목"
          maxLength={100}
          autoFocus
          defaultValue={post.title}
        />
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="내용"
          maxLength={5000}
          rows={10}
          defaultValue={post.content}
        />
        <button className="border p-2 rounded" type="submit">
          저장
        </button>
      </form>
    </>
  );
}
