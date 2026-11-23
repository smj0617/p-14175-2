"use client";

import type { PostDto } from "@/type/post";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  // posts: 글 목록. 처음에는 아직 받아오지 않았으므로 null
  const [posts, setPosts] = useState<PostDto[] | null>(null);

  // 화면이 처음 그려진 뒤 한 번만 실행
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/posts`)
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  if (posts == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>글 목록</h1>

      {posts.length == 0 && <div>글이 없습니다.</div>}

      {posts.length > 0 && (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`}>
                {post.id} : {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
