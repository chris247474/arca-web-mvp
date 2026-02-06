import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    query: {
      groups: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}));

import { db } from "@/db";
import {
  getGroupWithMembers,
  getGroupWithDeals,
  searchGroups,
} from "./groups";

describe("getGroupWithMembers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when groupId is not provided", async () => {
    const result = await getGroupWithMembers("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group ID is required");
  });

  it("should return group with all members", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "A test group",
      visibility: "private",
      inviteCode: "CODE1234",
      curatorId: "user-123",
      sector: "Tech",
      createdAt: new Date(),
      updatedAt: new Date(),
      curator: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
      memberships: [
        {
          id: "m1",
          userId: "user-123",
          groupId: "group-123",
          role: "curator",
          createdAt: new Date(),
          user: { id: "user-123", name: "John Doe", email: "john@example.com" },
        },
        {
          id: "m2",
          userId: "user-456",
          groupId: "group-123",
          role: "member",
          createdAt: new Date(),
          user: { id: "user-456", name: "Jane Doe", email: "jane@example.com" },
        },
      ],
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);

    const result = await getGroupWithMembers("group-123");

    expect(result.success).toBe(true);
    expect(result.group).toBeDefined();
    expect(result.members).toHaveLength(2);
    expect(result.members?.[0].name).toBe("John Doe");
  });

  it("should return error when group is not found", async () => {
    vi.mocked(db.query.groups.findFirst).mockResolvedValue(null as never);

    const result = await getGroupWithMembers("nonexistent-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group not found");
  });
});

describe("getGroupWithDeals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when groupId is not provided", async () => {
    const result = await getGroupWithDeals("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group ID is required");
  });

  it("should return group with all deals", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "A test group",
      visibility: "private",
      inviteCode: "CODE1234",
      curatorId: "user-123",
      sector: "Tech",
      createdAt: new Date(),
      updatedAt: new Date(),
      deals: [
        {
          id: "deal-1",
          name: "Deal 1",
          description: "First deal",
          groupId: "group-123",
          createdBy: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "deal-2",
          name: "Deal 2",
          description: "Second deal",
          groupId: "group-123",
          createdBy: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);

    const result = await getGroupWithDeals("group-123");

    expect(result.success).toBe(true);
    expect(result.group).toBeDefined();
    expect(result.deals).toHaveLength(2);
    expect(result.deals?.[0].name).toBe("Deal 1");
  });

  it("should return error when group is not found", async () => {
    vi.mocked(db.query.groups.findFirst).mockResolvedValue(null as never);

    const result = await getGroupWithDeals("nonexistent-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group not found");
  });
});

describe("searchGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all public groups when no query is provided", async () => {
    const mockGroups = [
      {
        id: "group-1",
        name: "Public Group 1",
        description: "Description 1",
        visibility: "public",
        sector: "Tech",
      },
      {
        id: "group-2",
        name: "Public Group 2",
        description: "Description 2",
        visibility: "public",
        sector: "Finance",
      },
    ];

    vi.mocked(db.query.groups.findMany).mockResolvedValue(mockGroups as never);

    const result = await searchGroups();

    expect(result.success).toBe(true);
    expect(result.groups).toHaveLength(2);
  });

  it("should filter groups by search query", async () => {
    const mockGroups = [
      {
        id: "group-1",
        name: "Tech Investors",
        description: "Technology investments",
        visibility: "public",
        sector: "Tech",
      },
    ];

    vi.mocked(db.query.groups.findMany).mockResolvedValue(mockGroups as never);

    const result = await searchGroups("Tech");

    expect(result.success).toBe(true);
    expect(result.groups).toBeDefined();
  });

  it("should filter groups by sector", async () => {
    const mockGroups = [
      {
        id: "group-1",
        name: "Finance Group",
        description: "Finance investments",
        visibility: "public",
        sector: "Finance",
      },
    ];

    vi.mocked(db.query.groups.findMany).mockResolvedValue(mockGroups as never);

    const result = await searchGroups(undefined, "Finance");

    expect(result.success).toBe(true);
    expect(result.groups).toBeDefined();
  });

  it("should filter by both query and sector", async () => {
    const mockGroups = [
      {
        id: "group-1",
        name: "Tech Finance Group",
        description: "Tech and Finance investments",
        visibility: "public",
        sector: "Finance",
      },
    ];

    vi.mocked(db.query.groups.findMany).mockResolvedValue(mockGroups as never);

    const result = await searchGroups("Tech", "Finance");

    expect(result.success).toBe(true);
    expect(result.groups).toBeDefined();
  });

  it("should return empty array when no groups match", async () => {
    vi.mocked(db.query.groups.findMany).mockResolvedValue([] as never);

    const result = await searchGroups("NonexistentQuery");

    expect(result.success).toBe(true);
    expect(result.groups).toHaveLength(0);
  });
});
