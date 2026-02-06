import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Memberships Server Actions", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMemberships", () => {
    it("should return empty array if groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { getMemberships } = await import("./memberships");
      const result = await getMemberships("");

      expect(result).toEqual([]);
    });
  });

  describe("getMembership", () => {
    it("should return null if userId or groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { getMembership } = await import("./memberships");

      expect(await getMembership("", "g1")).toBeNull();
      expect(await getMembership("u1", "")).toBeNull();
    });
  });

  describe("removeMember", () => {
    it("should return false if userId or groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { delete: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { removeMember } = await import("./memberships");

      expect(await removeMember("", "g1")).toBe(false);
      expect(await removeMember("u1", "")).toBe(false);
    });
  });

  describe("getUserMemberships", () => {
    it("should return empty array if userId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { getUserMemberships } = await import("./memberships");
      const result = await getUserMemberships("");

      expect(result).toEqual([]);
    });
  });

  describe("isCurator", () => {
    it("should return false if userId or groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { isCurator } = await import("./memberships");

      expect(await isCurator("", "g1")).toBe(false);
      expect(await isCurator("u1", "")).toBe(false);
    });
  });

  describe("createMembership", () => {
    it("should return null if userId or groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { insert: vi.fn() },
        memberships: {},
        users: {},
        groups: {},
      }));

      const { createMembership } = await import("./memberships");

      expect(await createMembership("", "g1", "member")).toBeNull();
      expect(await createMembership("u1", "", "member")).toBeNull();
    });
  });
});
