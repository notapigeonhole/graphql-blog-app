import { Context } from "../../index";
import { Post } from ".prisma/client";
import { canUserMutatePost } from "../../utils/canUserMutatePost";

interface PostArgs {
    post: {
        title?: string,
        content?: string
    }
}

interface PostPayloadType {
    userErrors: {
        message: string
    }[],
    post: Post | null
}

export const postResolvers = {
    postCreate: async (
        _: any,
        { post }: PostArgs,
        { prisma, userInfo }: Context
    ): Promise<PostPayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [{
                    message: "Forbidden access."
                }],
                post: null
            }
        }

        const { title, content } = post
        if (!title || !content) {
            return {
                userErrors: [{
                    message: "You must provide a title and a content to create a post."
                }],
                post: null
            };
        };
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: userInfo.userId
            }
        });
        return {
            userErrors: [],
            post: newPost
        };
    },
    postUpdate: async (
        _: any,
        { post, postId }: { postId: String, post: PostArgs["post"] },
        { prisma, userInfo }: Context
    ): Promise<PostPayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [{
                    message: "Forbidden access."
                }],
                post: null
            }
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma
        });

        if (error) return error;

        const { title, content } = post
        if (!title && !content) {
            return {
                userErrors: [
                    {
                        message: "Need to have at least 1 field to update"
                    }
                ],
                post: null
            }
        }
        const existingPost = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        });
        if (!existingPost) {
            return {
                userErrors: [
                    {
                        message: "Post does not exist"
                    }
                ],
                post: null
            }
        }

        let payloadToUpdate = {
            title,
            content
        }

        if (!title) delete payloadToUpdate.title
        if (!content) delete payloadToUpdate.content

        const updatedPost = await prisma.post.update({
            data: {
                ...payloadToUpdate
            },
            where: {
                id: Number(postId)
            }
        })

        return {
            userErrors: [],
            post: updatedPost
        }
    },
    postDelete: async (
        _: any,
        { postId }: { postId: String },
        { userInfo, prisma }: Context
    ): Promise<PostPayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [{
                    message: "Forbidden access."
                }],
                post: null
            }
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma
        });

        if (error) return error;

        const existingPost = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })
        if (!existingPost) {
            return {
                userErrors: [
                    {
                        message: "Post does not exist"
                    }
                ],
                post: null
            }
        }
        await prisma.post.delete({
            where: {
                id: Number(postId)
            }
        })
        return {
            userErrors: [],
            post: existingPost
        }
    },
    postPublish: async (
        _: any,
        { postId, publish }: { postId: String, publish: boolean },
        { userInfo, prisma }: Context
    ): Promise<PostPayloadType> => {
        if (!userInfo) {
            return {
                userErrors: [{
                    message: "Forbidden access."
                }],
                post: null
            }
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId, 
            postId: Number(postId), 
            prisma
        });

        if (error) return error;

        const existingPost = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        })
        if (!existingPost) {
            return {
                userErrors: [
                    {
                        message: "Post does not exist"
                    }
                ],
                post: null
            }
        }

        const updatedPost = await prisma.post.update({
            data: {
                published: publish
            },
            where: {
                id: Number(postId)
            }
        })

        return {
            userErrors: [],
            post: updatedPost
        }
    }
}