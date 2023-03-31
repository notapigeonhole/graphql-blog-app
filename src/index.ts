import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { Query, Mutation } from "./resolvers";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient
}

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Query,
        Mutation
    },
    context: {
        prisma,
    }
});

server.listen().then( ({url}) => {
    console.log(`Ready on server: ${url}`)
});