export const basicAuth = 'Basic YWRtaW46cXdlcnR5';

export const blogName = 'AnnaBlog';
export const blogDescription = 'AnnaBlog Description';
export const blogUrl = 'annablog.com';

export const postTitle = 'AnnaTitle';
export const postShortDescription = 'AnnaShortDescription';
export const postContent = 'AnnaPostContent';

export const myLogin = 'nakanai';
export const myEmail = 'nakanai.x@gmail.com';

export const secondLogin = 'nakanai1';
export const newPassword = 'nakanai1';
export const secondEmail = 'ana14i88@gmail.com';

export const thirdLogin = 'nakanai3';
export const thirdEmail = 'khobta.av@gmail.com';

export const fourthLogin = 'nakanai4';
export const fourthPassword = 'nakanai4';
export const fourthEmail = 'khontaav@gmail.com';
export const commentContent = 'Hello! Here is some content';

export type LoginPasswEmail = {
  login: string;
  password: string;
  email: string;
};

export const registrationData1 = {
  login: myLogin,
  password: myLogin,
  email: myEmail,
};

export const registrationData2 = {
  login: secondLogin,
  password: secondLogin,
  email: secondEmail,
};

export const registrationData3 = {
  login: thirdLogin,
  password: thirdLogin,
  email: thirdEmail,
};

export const createBlogData = {
  name: blogName,
  description: blogDescription,
  websiteUrl: blogUrl,
};

export const createPostData = {
  title: postTitle,
  shortDescription: postShortDescription,
  content: postContent,
};

export const banUserByBloggerData = {
  isBanned: true,
  banReason: 'stringstringstringst',
};

export const createCommentData = {
  content: 'contentcontentcontentcontent',
};

export const create12UsersData = [
  { login: 'user01', password: '123456', email: '123456@mai.com' },
  { login: 'useee01', password: '1234567', email: '1234567@mai.com' },
  { login: 'log02', password: '1234568', email: '1234568@mai.com' },
  { login: 'some01', password: '1234560', email: '1234560@mai.com' },
  { login: 'uer15', password: 'q123456', email: 'q123456@mai.com' },
  { login: 'use4406', password: 'y123456', email: 'y123456@mai.com' },
  { login: 'log01', password: 'r123456', email: 'r123456@mai.com' },
  { login: 'loSer', password: 'h123456', email: 'h123456@mai.com' },
  { login: 'user02', password: '1v23456', email: '1v23456@mai.com' },
  { login: 'zzz111', password: '123d456', email: '123d456@mai.com' },
  { login: 'xxx111', password: '1234a56', email: '1234a56@mai.com' },
  { login: 'www111', password: '12w3456', email: '12w3456@mai.com' },
];
