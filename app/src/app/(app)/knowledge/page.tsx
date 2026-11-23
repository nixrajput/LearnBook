"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraphView } from "@/components/knowledge/graph-view";
import { ConceptPanel } from "@/components/knowledge/concept-panel";

interface GraphNode {
  id: string;
  name: string;
  linkCount: number;
  chapters: string[];
  courses: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  sharedChapters: number;
}

export default function KnowledgePage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/knowledge-graph")
      .then((r) => {
        if (!r.ok) throw r;
        return r.json();
      })
      .then((data) => {
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
      })
      .catch(async (r) => {
        if (r?.status === 403) {
          setError("upgrade");
        } else {
          setError("Failed to load knowledge graph");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-muted-foreground">Loading knowledge graph...</p>
      </div>
    );
  }

  if (error === "upgrade") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h2 className="mb-2 text-xl font-bold">Knowledge Graph</h2>
        <p className="mb-6 text-muted-foreground">
          Upgrade to Pro or Premium to visualize connections across your reading.
        </p>
        <Button asChild>
          <Link href="/pricing" className="gap-1.5">
            View Plans <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Graph</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {nodes.length} concept{nodes.length !== 1 ? "s" : ""} · {edges.length} connection
          {edges.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GraphView
            nodes={nodes}
            edges={edges}
            onNodeClick={setSelectedNode}
            selectedNodeId={selectedNode}
          />
        </div>
        <div>
          <ConceptPanel conceptId={selectedNode} />
        </div>
      </div>
    </div>
  );
}
