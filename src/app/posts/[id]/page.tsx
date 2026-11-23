"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostDto } from "@/type/post";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  // 코드로 페이지를 이동할 때 쓰는 도구
  const router = useRouter();

  // 주소 /posts/3 의 "3"을 꺼낸다. 주소에서 꺼낸 값은 항상 문자열
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const [post, setPost] = useState<PostDto | null>(null);

  // id가 바뀔 때마다 그 글을 다시 받아온다
  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, [id]);

  // 이 글에 달린 댓글 목록. 처음에는 아직 받아오지 않았으므로 null
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}/comments`)
      .then(setPostComments)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, [id]);

  // 주의: useState, useEffect 같은 훅은 모두 이 줄(조기 return)보다 위에 있어야 한다
  if (post == null) return <div>로딩중...</div>;

  // 삭제 버튼을 눌렀을 때 실행
  const deletePost = () => {
    // 취소를 누르면 confirm이 false → 여기서 끝냄
    if (!confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`)) return;

    apiFetch(`/api/v1/posts/${post.id}`, {
      method: "DELETE",
    })
      .then((data) => {
        alert(data.msg);

        // 삭제된 글 페이지는 기록에서 지우고 글 목록으로 이동
        router.replace("/posts");
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  return (
    <>
      <h1>글 상세페이지</h1>

      <div>번호 : {post.id}</div>
      <div>제목 : {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button className="p-2 rounded border cursor-pointer" onClick={deletePost}>
          삭제
        </button>
        <Link className="p-2 rounded border" href={`/posts/${post.id}/edit`}>
          수정
        </Link>
      </div>

      <hr className="my-2" />

      <h2>{id}번 글에 대한 댓글 목록</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {postComments.map((comment) => (
            <li key={comment.id}>
              {comment.id} :{" "}
              <span style={{ whiteSpace: "pre-line" }}>{comment.content}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
