import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import {readFile} from "node:fs/promises";
// import { createServer } from "http";
import {resolvers} from "./resolvers.js";
import { authMiddleware, handleLogin } from "./auth.js";
import { getUser } from "./db/users.js";
import { create } from "node:domain";
import { createCompanyLoader } from "./db/companies.js";


async function  getContext({req, res}){

    if(!req.auth) return {user:null}

    const companyLoader = createCompanyLoader();
    const context ={companyLoader}

    const user = await getUser(req.auth.sub);
    context.user = user;
    return context
}
const port = 9000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware)

const typeDefs = await readFile("./schema.graphql", "utf8"); 

app.post("/login", handleLogin);

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();

app.use("/graphql", expressMiddleware(apolloServer, {context:getContext}));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    });