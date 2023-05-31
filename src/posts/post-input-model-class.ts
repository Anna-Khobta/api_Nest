import { Length } from 'class-validator';

export class CreatePostInputModelClass {
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  @Length(1, 18)
  blogId: string;
}
