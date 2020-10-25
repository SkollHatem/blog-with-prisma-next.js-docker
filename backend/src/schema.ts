import { intArg, makeSchema, objectType, stringArg } from "@nexus/schema";
import { nexusPrisma } from "nexus-plugin-prisma";

const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.name();
    t.model.role();
    t.model.posts({
      pagination: false,
    });
    t.model.profile();
  },
});

const Profile = objectType({
  name: "Profile",
  definition(t) {
    t.model.id();
    t.model.bio();
    t.model.user();
    t.model.userId();
  },
});

const Post = objectType({
  name: "Post",
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.title();
    t.model.published();
    t.model.author();
    t.model.authorId();
    t.model.categories();
  },
});

const Category = objectType({
  name: "Category",
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.posts();
  },
});

const Query = objectType({
  name: "Query",
  definition(t) {
    t.crud.post();

    t.list.field("feed", {
      type: "Post",
      resolve: (_, args, ctx) => {
        return ctx.prisma.post.findMany({
          where: { published: true },
        });
      },
    });

    // t.list.field("filterPosts", {
    //   type: "Post",
    //   args: {
    //     searchString: stringArg({ nullable: true }),
    //   },
    //   resolve: (_, { searchString }, ctx) => {
    //     return ctx.prisma.post.findMany({
    //       where: {
    //         OR: [
    //           { title: { contains: searchString || "" } },
    //           { content: { contains: searchString || "" } },
    //         ],
    //       },
    //     });
    //   },
    // });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.crud.createOnePost({ alias: "newPost" });
    t.crud.createOneCategory({ alias: "newCategory" });
    t.crud.createOneProfile({ alias: "newProfile" });
    t.crud.createOneUser({ alias: "newUser" });
    // t.crud.createOneUser({ alias: "signupUser" });
    // t.crud.deleteOnePost();

    // t.field("createDraft", {
    //   type: "Post",
    //   args: {
    //     title: stringArg({ nullable: false }),
    //     content: stringArg(),
    //     authorEmail: stringArg({ nullable: false }),
    //   },
    //   resolve: (_, { title, content, authorEmail }, ctx) => {
    //     return ctx.prisma.post.create({
    //       data: {
    //         title,
    //         content,
    //         published: false,
    //         author: {
    //           connect: { email: authorEmail },
    //         },
    //       },
    //     });
    //   },
    // });

    // t.field("publish", {
    //   type: "Post",
    //   nullable: true,
    //   args: {
    //     id: intArg(),
    //   },
    //   resolve: (_, { id }, ctx) => {
    //     return ctx.prisma.post.update({
    //       where: { id: Number(id) },
    //       data: { published: true },
    //     });
    //   },
    // });
  },
});

export const schema = makeSchema({
  types: [Query, Mutation, Post, User, Profile, Category],
  plugins: [nexusPrisma({ experimentalCRUD: true })],
  outputs: {
    schema: __dirname + "/../schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  typegenAutoConfig: {
    contextType: "Context.Context",
    sources: [
      {
        source: "@prisma/client",
        alias: "prisma",
      },
      {
        source: require.resolve("./context"),
        alias: "Context",
      },
    ],
  },
});
