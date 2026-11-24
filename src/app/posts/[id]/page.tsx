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

  // 이 훅이 어느 글의 댓글을 다루는지(postId)도 함께 돌려준다
  // → 하위 컴포넌트가 글 번호를 props로 따로 받지 않아도 된다
  return { postId, postComments, deleteComment, writeComment };
}

// 컴포넌트 1: 글 정보(번호, 제목, 내용) + 삭제/수정 버튼
// 부모(Page)가 넘겨준 값(props)만 가지고 화면을 그린다
// postState = usePost가 돌려준 객체 통째로. 타입은 usePost의 반환 타입을 그대로 쓴다
function PostInfo({ postState }: { postState: ReturnType<typeof usePost> }) {
  // 페이지 이동 도구는 이제 이동이 필요한 이 컴포넌트가 직접 가져온다
  const router = useRouter();

  // 받은 객체에서 필요한 것을 꺼낸다
  const { post, deletePost: _deletePost } = postState;

  // 글 로딩 처리도 글을 그리는 이 컴포넌트가 맡는다 (훅 호출보다 아래에 둔다)
  if (post == null) return <div>로딩중...</div>;

  // 삭제 버튼을 눌렀을 때 실행 (Page에 있던 것을 옮김)
  // 확인 창 + 성공 후 이동은 삭제 버튼을 그리는 이 컴포넌트의 몫
  const deletePost = () => {
    // 취소를 누르면 confirm이 false → 여기서 끝냄
    if (!confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`)) return;

    _deletePost((data) => {
      alert(data.msg);

      // 삭제된 글 페이지는 기록에서 지우고 글 목록으로 이동
      router.replace("/posts");
    });
  };

  return (
    <>
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
    </>
  );
}

// 컴포넌트 2-1: 댓글 작성 폼
// postCommentsState = usePostComments가 돌려준 객체 통째로
function PostCommentWrite({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  // 글 번호(postId)도 훅이 함께 돌려주므로 props로 따로 받을 필요가 없다
  const { postId, writeComment } = postCommentsState;

  // 댓글 작성 폼을 제출했을 때 실행
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
      <h2>{postId}번 글에 대한 댓글 작성</h2>

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
    </>
  );
}

// 컴포넌트 2-2: 댓글 목록
function PostCommentList({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  const {
    postId,
    postComments,
    deleteComment: _deleteComment,
  } = postCommentsState;

  // 댓글 삭제 버튼을 눌렀을 때 실행
  const deleteComment = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    // 페이지 이동 없이 알림만. 목록 갱신은 훅이 state를 바꿔서 처리
    _deleteComment(commentId, (data) => {
      alert(data.msg);
    });
  };

  return (
    <>
      <h2>{postId}번 글에 대한 댓글 목록</h2>

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

// 컴포넌트 2: 댓글 작성 폼 + 댓글 목록을 배치만 한다
function PostCommentWriteAndList({
  postCommentsState,
}: {
  postCommentsState: ReturnType<typeof usePostComments>;
}) {
  return (
    <>
      <PostCommentWrite postCommentsState={postCommentsState} />

      <hr className="my-2" />

      <PostCommentList postCommentsState={postCommentsState} />
    </>
  );
}

export default function Page() {
  // 주소 /posts/3 의 "3"을 꺼낸다. 주소에서 꺼낸 값은 항상 문자열
  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  // 훅 결과를 구조 분해하지 않고 객체 통째로 받아 둔다
  const postState = usePost(id);
  const postCommentsState = usePostComments(id);

  // Page는 이제 "데이터 준비 + 하위 컴포넌트 배치"만 한다
  // 훅 결과 객체를 그대로 넘긴다 (로딩 처리는 PostInfo가 한다)
  return (
    <>
      <h1>글 상세페이지</h1>

      <PostInfo postState={postState} />

      <hr className="my-2" />

      <PostCommentWriteAndList postCommentsState={postCommentsState} />
    </>
  );
}
