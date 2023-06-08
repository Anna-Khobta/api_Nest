import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAccessGuard } from '../auth-guards/jwt-access.guard';
import {
  MakeLikeInputModel,
  UpdateCommentInputModel,
} from './comments-input.classes';
import { CurrentUserId } from '../decorators/current-user-id.param.decorator';
import { CommentsService } from './comments.service';
import { CustomException } from '../functions/custom-exception';
import { IfHaveUserJwtAccessGuard } from '../auth-guards/if.have.user.jwt-access.guard';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAccessGuard)
  async createBlog(
    @Param('id') commentId: string,
    @Body() inputModel: UpdateCommentInputModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const checkUserOwnComment = await this.commentsService.checkUser(
      currentUserId,
      commentId,
    );

    if (checkUserOwnComment === 'NotFound') {
      throw new CustomException('No such comment in Db', HttpStatus.NOT_FOUND);
    }

    if (!checkUserOwnComment) {
      throw new CustomException(
        'This comment belongs to other user',
        HttpStatus.FORBIDDEN,
      );
    }
    const updatedCommentWithoutId = await this.commentsService.updateComment(
      commentId,
      inputModel.content,
    );
    if (!updatedCommentWithoutId) {
      throw new CustomException('Cant update comment', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  @Get(':id')
  @UseGuards(IfHaveUserJwtAccessGuard)
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const getComment = await this.commentsService.getCommentWithWithoutUser(
      commentId,
      currentUserId,
    );
    if (!getComment) {
      throw new CustomException('Cant update comment', HttpStatus.NOT_FOUND);
    }
    return getComment;
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  async deleteCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const deleteComment = await this.commentsService.deleteCommentIfOwn(
      commentId,
      currentUserId,
    );
    if (deleteComment === 'NotFound') {
      throw new CustomException('Comment not found', HttpStatus.NOT_FOUND);
    }
    if (deleteComment === 'NotOwnComment') {
      throw new CustomException('Not your comment', HttpStatus.FORBIDDEN);
    }
    if (!deleteComment) {
      throw new CustomException(
        'Other problems with DB',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  @Put(':commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAccessGuard)
  async makeLikeOperationOnComment(
    @Body() inputModel: MakeLikeInputModel,
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const updateCommentLikeStatus =
      await this.commentsService.updateCommentStatus(
        commentId,
        currentUserId,
        inputModel.likeStatus,
      );

    if (updateCommentLikeStatus === 'NotFound') {
      throw new CustomException('Comment not found', HttpStatus.NOT_FOUND);
    }
    if (updateCommentLikeStatus === 'BadRequest') {
      throw new CustomException('Something wrong', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
}
