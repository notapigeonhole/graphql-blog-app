import { Context } from "..";
import { userLoader } from "../loaders/userLoaders";

interface PostParentType {
    authorId: number;
}

export const Post = {
    user: (parent: PostParentType, __: any, { prisma }: Context) => {
        return userLoader.load(parent.authorId);
    }
};
