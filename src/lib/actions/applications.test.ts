import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Applications Server Actions", () => {
  // Clear module cache to ensure fresh imports each time
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("submitApplication", () => {
    it("should return null if userId is not provided", async () => {
      // Mock db after resetModules
      vi.doMock("@/db", () => ({
        db: {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
          insert: vi.fn(),
        },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { submitApplication } = await import("./applications");
      const result = await submitApplication("group-1", {
        userId: "",
        linkedinUrl: "https://linkedin.com/in/testuser",
        interestStatement: "I am interested",
      });

      expect(result).toBeNull();
    });

    it("should return null if groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: {
          select: vi.fn(),
          insert: vi.fn(),
        },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { submitApplication } = await import("./applications");
      const result = await submitApplication("", {
        userId: "user-1",
        linkedinUrl: "https://linkedin.com/in/testuser",
        interestStatement: "I am interested",
      });

      expect(result).toBeNull();
    });
  });

  describe("getApplications", () => {
    it("should return empty array if groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { getApplications } = await import("./applications");
      const result = await getApplications("");

      expect(result).toEqual([]);
    });
  });

  describe("getPendingApplicationCount", () => {
    it("should return 0 if groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { getPendingApplicationCount } = await import("./applications");
      const result = await getPendingApplicationCount("");

      expect(result).toBe(0);
    });
  });

  describe("approveApplication", () => {
    it("should return null if application id is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: {
          select: vi.fn(),
          update: vi.fn(),
          insert: vi.fn(),
        },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { approveApplication } = await import("./applications");
      const result = await approveApplication("");

      expect(result).toBeNull();
    });
  });

  describe("rejectApplication", () => {
    it("should return null if application id is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { update: vi.fn() },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { rejectApplication } = await import("./applications");
      const result = await rejectApplication("");

      expect(result).toBeNull();
    });
  });

  describe("getUserApplication", () => {
    it("should return null if userId or groupId is not provided", async () => {
      vi.doMock("@/db", () => ({
        db: { select: vi.fn() },
        applications: {},
        memberships: {},
        users: {},
      }));

      const { getUserApplication } = await import("./applications");

      expect(await getUserApplication("", "group-1")).toBeNull();
      expect(await getUserApplication("user-1", "")).toBeNull();
    });
  });
});
