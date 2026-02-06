import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["curator", "investor"]);
export const groupVisibilityEnum = pgEnum("group_visibility", [
  "public",
  "private",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);
export const membershipRoleEnum = pgEnum("membership_role", [
  "curator",
  "member",
]);
export const commentVisibilityEnum = pgEnum("comment_visibility", [
  "public",
  "private",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  privyId: text("privy_id").unique().notNull(),
  name: text("name"),
  email: text("email").unique(),
  role: userRoleEnum("role"),
  linkedinUrl: text("linkedin_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Groups table
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  visibility: groupVisibilityEnum("visibility").default("private").notNull(),
  inviteCode: text("invite_code").unique(),
  curatorId: uuid("curator_id")
    .references(() => users.id)
    .notNull(),
  sector: text("sector"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deals table
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  groupId: uuid("group_id")
    .references(() => groups.id)
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  storagePath: text("storage_path").notNull(),
  dealId: uuid("deal_id")
    .references(() => deals.id)
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Applications table
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  groupId: uuid("group_id")
    .references(() => groups.id)
    .notNull(),
  status: applicationStatusEnum("status").default("pending").notNull(),
  linkedinUrl: text("linkedin_url"),
  interestStatement: text("interest_statement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Memberships table
export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  groupId: uuid("group_id")
    .references(() => groups.id)
    .notNull(),
  role: membershipRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  dealId: uuid("deal_id")
    .references(() => deals.id)
    .notNull(),
  parentId: uuid("parent_id"),
  visibility: commentVisibilityEnum("visibility").default("public").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  groups: many(groups),
  deals: many(deals),
  documents: many(documents),
  applications: many(applications),
  memberships: many(memberships),
  comments: many(comments),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  curator: one(users, {
    fields: [groups.curatorId],
    references: [users.id],
  }),
  deals: many(deals),
  applications: many(applications),
  memberships: many(memberships),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  group: one(groups, {
    fields: [deals.groupId],
    references: [groups.id],
  }),
  createdByUser: one(users, {
    fields: [deals.createdBy],
    references: [users.id],
  }),
  documents: many(documents),
  comments: many(comments),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  deal: one(deals, {
    fields: [documents.dealId],
    references: [deals.id],
  }),
  uploadedByUser: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [applications.groupId],
    references: [groups.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [memberships.groupId],
    references: [groups.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [comments.dealId],
    references: [deals.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, {
    relationName: "commentReplies",
  }),
}));
