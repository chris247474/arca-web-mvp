import type {
  users,
  groups,
  deals,
  documents,
  applications,
  memberships,
  comments,
} from "./schema";

// Inferred select types (for reading from database)
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Comment = typeof comments.$inferSelect;

// Inferred insert types (for writing to database)
export type NewUser = typeof users.$inferInsert;
export type NewGroup = typeof groups.$inferInsert;
export type NewDeal = typeof deals.$inferInsert;
export type NewDocument = typeof documents.$inferInsert;
export type NewApplication = typeof applications.$inferInsert;
export type NewMembership = typeof memberships.$inferInsert;
export type NewComment = typeof comments.$inferInsert;

// Enum types
export type UserRole = "curator" | "investor";
export type GroupVisibility = "public" | "private";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type MembershipRole = "curator" | "member";
export type CommentVisibility = "public" | "private";
