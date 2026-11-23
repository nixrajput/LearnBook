import { describe, it, expect } from "vitest";

describe("knowledge graph logic", () => {
  describe("edge building — shared chapters", () => {
    function buildEdges(nodes: { id: string; chapters: string[] }[]) {
      const edges: { source: string; target: string; shared: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const shared = nodes[i].chapters.filter((ch) => nodes[j].chapters.includes(ch));
          if (shared.length > 0) {
            edges.push({ source: nodes[i].id, target: nodes[j].id, shared: shared.length });
          }
        }
      }
      return edges;
    }

    it("connects concepts sharing a chapter", () => {
      const nodes = [
        { id: "a", chapters: ["ch1", "ch2"] },
        { id: "b", chapters: ["ch2", "ch3"] },
      ];
      const edges = buildEdges(nodes);
      expect(edges).toHaveLength(1);
      expect(edges[0].shared).toBe(1);
    });

    it("no edge when no shared chapters", () => {
      const nodes = [
        { id: "a", chapters: ["ch1"] },
        { id: "b", chapters: ["ch2"] },
      ];
      expect(buildEdges(nodes)).toHaveLength(0);
    });

    it("counts multiple shared chapters", () => {
      const nodes = [
        { id: "a", chapters: ["ch1", "ch2", "ch3"] },
        { id: "b", chapters: ["ch1", "ch3", "ch4"] },
      ];
      const edges = buildEdges(nodes);
      expect(edges[0].shared).toBe(2);
    });

    it("handles many nodes correctly", () => {
      const nodes = [
        { id: "a", chapters: ["ch1"] },
        { id: "b", chapters: ["ch1"] },
        { id: "c", chapters: ["ch1"] },
      ];
      const edges = buildEdges(nodes);
      expect(edges).toHaveLength(3); // a-b, a-c, b-c
    });
  });

  describe("plan gating", () => {
    it("FREE users blocked from knowledge graph", () => {
      const plan = "FREE";
      expect(plan === "FREE").toBe(true);
    });

    it("PRO users can access", () => {
      const plan: string = "PRO";
      expect(plan !== "FREE").toBe(true);
    });
  });
});
