// 백엔드 PostDto(Java record)와 같은 모양의 TypeScript 타입
export type PostDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  title: string;
  content: string;
};

// 백엔드 PostCommentDto(Java record)와 같은 모양
export type PostCommentDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  content: string;
};
