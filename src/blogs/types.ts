import {ObjectId} from "mongodb";


export type BlogType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
}

export type BlogsWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogType[]
}



export type PostViewType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatusesEnum,
        newestLikes: NewestLikesType[]
    }
}


export type PostsWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostViewType[]
}
/*

export type PostDbType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    likesCount: number,
    dislikesCount: number,
    usersEngagement: UserLikeInfo[]
}

*/



export class PostDbType {

    createdAt: string
    likesCount: number
    dislikesCount: number
    usersEngagement: UserLikeInfo[]

    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string) {

        this.title = title;
        this.shortDescription = shortDescription;
        this.content = content;
        this.blogId = blogId;
        this.blogName = blogName;
        this.createdAt = (new Date()).toISOString();
        this.likesCount = 0;
        this.dislikesCount = 0;
        this.usersEngagement = []
    }
}

export type CommentDBType = {
    //id: string,
    postId: string,
    content: string,
    createdAt: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    likesCount: number,
    dislikesCount: number,
    usersEngagement: UserLikeInfo[]
}


export type UserLikeInfo = {
    userId: string,
    createdAt: string,
    userStatus: LikeStatusesEnum
}

export type NewestLikesType = {
    addedAt: string,
    userId: string,
    login: string
}


export type CommentWithMongoId = CommentDBType & { _id: ObjectId; }





/*
export type UserLikeInfo = {
    userId: string,
    createdAt: string
}*/

export enum LikeStatusesEnum  {
    Like = "Like",
    Dislike = "Dislike",
    None = "None"
}

// export type LikeStatusType = "Like" | "Dislike" | "None"


export type CommentViewType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatusesEnum
    }
}




export type UserViewType = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export type UsersWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewType[]
}

export type UserDbType = {
    //id: string,
    accountData: {
        login: string,
        email: string,
        hashPassword: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null,
        exp: Date | null

    }
}

export type UserWithMongoId = UserDbType & { _id: ObjectId; }

export type UserTypeWiithoutIds = {
    accountData: {
        login: string,
        email: string,
        hashPassword: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null,
        exp: Date | null

    }
}

export type UserInfoForEmail = {
    id: string,
    email: string,
    confirmationCode: string
}


export type TokenDBType = {
    iat: number,
    exp: number,
    deviceId: string,
    deviceTitle: string,
    ip: string,
    userId: string
}

export type ipDbType = {
    ip: string,
    iat: Date,
    endpoint: string
}

export type deviceViewType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}


