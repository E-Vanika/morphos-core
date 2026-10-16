import { describe, expect, it } from "vitest";
import { retrieveKnowledge } from "./knowledge";

describe("retrieveKnowledge", () => {
  it("retrieves bridal finishes for a comparison question", () => {
    expect(retrieveKnowledge("Compare matte and glow finishes", "bridal-makeup")[0]?.id).toBe("bridal-finishes");
  });

  it("retrieves booking policy for availability questions", () => {
    expect(retrieveKnowledge("Is my wedding date available?", "bridal-makeup")[0]?.id).toBe("booking-process");
  });

  it("returns no context for an unrelated question", () => {
    expect(retrieveKnowledge("What is the weather tomorrow?", "bridal-makeup")).toEqual([]);
  });

  it("keeps craft retrieval separate from bridal knowledge", () => {
    expect(retrieveKnowledge("How much is a pencil portrait?", "art-craft")[0]?.id).toBe("craft-services");
  });
});
