// 백엔드 PostDto(Java record)와 같은 모양의 TypeScript 타입
export type PostDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  title: string;
  content: string;
};
