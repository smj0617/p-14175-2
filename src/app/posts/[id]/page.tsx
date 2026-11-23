"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, PostDto } from "@/type/post";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 커스텀 훅 1: 글 하나에 관한 것(불러오기, 삭제)을 묶는다
function usePost(id: number) {
  const [post, setPost] = useState<PostDto | null>(null);

  // id가 바뀔 때마다 그 글을 다시 받아온다
  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`)
      .then(setPost)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, [id]);

  // 삭제 요청. 성공한 뒤 무엇을 할지(onSuccess)는 부르는 쪽이 정한다
  const deletePost = (onSuccess: (data: { msg: string }) => void) => {
    apiFetch(`/api/v1/posts/${id}`, {
      method: "DELETE",
    })
      .then(onSuccess)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  return { post, deletePost };
}

// 커스텀 훅 2: 이 글의 댓글 목록에 관한 것을 묶는다
function usePostComments(postId: number) {
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`)
      .then(setPostComments)
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  }, [postId]);

  // 댓글 삭제 요청. 성공하면 화면의 목록에서도 그 댓글을 뺀다
  const deleteComment = (
    commentId: number,
    onSuccess: (data: { msg: string }) => void,
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    })
      .then((data) => {
        if (postComments == null) return;

        // filter: 조건이 true인 것만 남긴 "새 배열"을 만든다 → 삭제한 댓글만 빠짐
        setPostComments(postComments.filter((c) => c.id != commentId));

        onSuccess(data);
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  // 댓글 작성 요청. 성공하면 응답으로 온 새 댓글을 목록 끝에 붙인다
  const writeComment = (
    content: string,
    onSuccess: (data: { msg: string }) => void,
  ) => {
    apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
      .then((data) => {
        if (postComments == null) return;

        // [...기존배열, 새것]: 기존 댓글을 펼쳐 넣고 끝에 새 댓글을 더한 "새 배열"
        setPostComments([...postComments, data.data]);

        onSuccess(data);
      })
      .catch((error) => {
        alert(`${error.resultCode} : ${error.msg}`);
      });
  };

  return { postComments, deleteComment, writeComment };
}

export default function Page() {
  // 코드로 페이지를 이동할 때 쓰는 도구
  const router = useRouter();

  // 주소 /posts/3 의 "3"을 꺼낸다. 주소에서 꺼낸 값은 항상 문자열
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  // 커스텀 훅도 훅이므로 조기 return보다 위에서 호출한다
  const { post, deletePost: _deletePost } = usePost(id);
  const {
    postComments,
    deleteComment: _deleteComment,
    writeComment,
  } = usePostComments(id);

  if (post == null) return <div>로딩중...</div>;

  // 삭제 버튼을 눌렀을 때 실행: 확인 창 + 성공 후 이동은 화면(페이지)의 몫
  const deletePost = () => {
    // 취소를 누르면 confirm이 false → 여기서 끝냄
    if (!confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`)) return;

    _deletePost((data) => {
      alert(data.msg);

      // 삭제된 글 페이지는 기록에서 지우고 글 목록으로 이동
      router.replace("/posts");
    });
  };

  // 댓글 삭제 버튼을 눌렀을 때 실행
  const deleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    // 페이지 이동 없이 알림만. 목록 갱신은 훅이 state를 바꿔서 처리
    _deleteComment(commentId, (data) => {
      alert(data.msg);
    });
  };

  // 댓글 작성 폼을 제출했을 때 실행 (5-1, 5-2 글쓰기 폼과 같은 방식)
  const handleCommentWriteFormSubmit = (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    contentTextarea.value = contentTextarea.value.trim();

    if (contentTextarea.value.length === 0) {
      alert("댓글 내용을 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    if (contentTextarea.value.length < 2) {
      alert("댓글 내용을 2자 이상 입력해주세요.");
      contentTextarea.focus();
      return;
    }

    writeComment(contentTextarea.value, (data) => {
      alert(data.msg);

      // 다음 댓글을 쓸 수 있게 입력칸 비우기
      contentTextarea.value = "";
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

      <h2>{id}번 글에 대한 댓글 작성</h2>

      <form
        className="flex gap-2 items-center"
        onSubmit={handleCommentWriteFormSubmit}
      >
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="댓글 내용"
          maxLength={100}
          rows={3}
        />
        <button className="p-2 rounded border cursor-pointer" type="submit">
          작성
        </button>
      </form>

      <hr className="my-2" />

      <h2>{id}번 글에 대한 댓글 목록</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {postComments.map((comment) => (
            <li key={comment.id} className="flex gap-2 items-center">
              <span>{comment.id} :</span>
              <span style={{ whiteSpace: "pre-line" }}>{comment.content}</span>
              <button
                className="p-2 rounded border cursor-pointer"
                onClick={() => deleteComment(comment.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
