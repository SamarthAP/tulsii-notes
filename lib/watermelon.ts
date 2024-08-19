// import {
//   ColumnName,
//   Database,
//   Model,
//   Relation,
//   TableName,
//   associations,
// } from "@nozbe/watermelondb";
// import { field, date, text, relation } from "@nozbe/watermelondb/decorators";
// import { Associations } from "@nozbe/watermelondb/Model";
// import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
// import { setGenerator } from "@nozbe/watermelondb/utils/common/randomId";
// import { appSchema, tableSchema } from "@nozbe/watermelondb";
// import * as Crypto from "expo-crypto";

// export enum NoteType {
//   Regular = "regular",
//   Daily = "daily",
// }

// export class Note extends Model {
//   static table: TableName<Note> = "notes";

//   static associations: Associations = {
//     messages: { type: "has_many", foreignKey: "note_id" as ColumnName },
//   };

//   // @ts-ignore
//   @field("user_id") userId!: string;
//   // @ts-ignore
//   @text("title") title?: string;
//   // @ts-ignore
//   @field("note_type") noteType!: NoteType;
//   // @ts-ignore
//   @date("date") date!: Date;
//   // @ts-ignore
//   @date("created_at") createdAt!: Date;
//   // @ts-ignore
//   @date("updated_at") updatedAt!: Date;
//   // @ts-ignore
//   @date("deleted_at") deletedAt?: Date;
// }

// export class Message extends Model {
//   static table: TableName<Message> = "messages";

//   static associations: Associations = {
//     notes: { type: "belongs_to", key: "note_id" as ColumnName },
//   };

//   // @ts-ignore
//   @field("note_id") noteId!: string;
//   // @ts-ignore
//   @field("user_id") userId!: string;
//   // @ts-ignore
//   @text("content") content!: string;
//   // @ts-ignore
//   @date("created_at") createdAt!: Date;
//   // @ts-ignore
//   @date("updated_at") updatedAt!: Date;
//   // @ts-ignore
//   @date("deleted_at") deletedAt?: Date;

//   // @ts-ignore
//   @relation("notes", "note_id") note!: Relation<Note>;
// }

// // Schema definition
// export const schema = appSchema({
//   version: 1,
//   tables: [
//     tableSchema({
//       name: "notes",
//       columns: [
//         { name: "user_id", type: "string", isOptional: true },
//         { name: "title", type: "string", isOptional: true },
//         { name: "note_type", type: "string" },
//         { name: "date", type: "number" },
//         { name: "created_at", type: "number" },
//         { name: "updated_at", type: "number" },
//         { name: "deleted_at", type: "number", isOptional: true },
//       ],
//     }),
//     tableSchema({
//       name: "messages",
//       columns: [
//         { name: "note_id", type: "string", isIndexed: true },
//         { name: "user_id", type: "string", isIndexed: true },
//         { name: "content", type: "string" },
//         { name: "created_at", type: "number" },
//         { name: "updated_at", type: "number" },
//         { name: "deleted_at", type: "number", isOptional: true },
//       ],
//     }),
//   ],
// });

// // First, create the adapter to the underlying database:
// const adapter = new SQLiteAdapter({
//   schema,
//   // (You might want to comment it out for development purposes -- see Migrations documentation)
//   // migrations,
//   // (optional database name or file system path)
//   dbName: "tulsii",
//   // (recommended option, should work flawlessly out of the box on iOS. On Android,
//   // additional installation steps have to be taken - disable if you run into issues...)
//   jsi: true /* Platform.OS === 'ios' */,
//   // (optional, but you should implement this method)
//   onSetUpError: (error) => {
//     // Database failed to load -- offer the user to reload the app or log out
//     console.error(error);
//   },
// });

// export const database = new Database({
//   adapter,
//   modelClasses: [Note, Message],
// });

// setGenerator(() => Crypto.randomUUID());
