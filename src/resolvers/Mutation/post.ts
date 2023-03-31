import { Context } from "../../index";
import { Post } from ".prisma/client";

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
    { prisma }: Context
  ): Promise<PostPayloadType> => {
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
              authorId: 1
          }
      });
      return {
          userErrors: [],
          post: newPost
      };
  },
  postUpdate: async (
      _: any,
      { post, postId } : { postId: String, post: PostArgs["post"] },
      { prisma }: Context
  ): Promise<PostPayloadType> => {
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
      { prisma }: Context
  ): Promise<PostPayloadType> => {
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
}