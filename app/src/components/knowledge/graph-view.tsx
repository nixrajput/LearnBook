"use client";

import { useState, useEffect, useRef } from "react";

interface GraphNode {
  id: string;
  name: string;
  linkCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  sharedChapters: number;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}

/**
 * Simple force-directed graph using canvas.
 * A lightweight alternative to react-force-graph that doesn't require additional dependencies.
 */
export function GraphView({
  nodes: initialNodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const animRef = useRef<number>(0);

  // Initialize node positions
  useEffect(() => {
    const w = 600;
    const h = 400;
    const positioned = initialNodes.map((n, i) => ({
      ...n,
      x:
        w / 2 +
        Math.cos((i / initialNodes.length) * Math.PI * 2) * 150 +
        (Math.random() - 0.5) * 50,
      y:
        h / 2 +
        Math.sin((i / initialNodes.length) * Math.PI * 2) * 150 +
        (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0,
    }));
    setNodes(positioned);
  }, [initialNodes]);

  // Simple force simulation + render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx = maybeCtx; // non-null for closure capture

    const w = canvas.width;
    const h = canvas.height;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    function tick() {
      // Force simulation
      for (const node of nodes) {
        // Center gravity
        node.vx = (node.vx ?? 0) * 0.9 + (w / 2 - (node.x ?? 0)) * 0.001;
        node.vy = (node.vy ?? 0) * 0.9 + (h / 2 - (node.y ?? 0)) * 0.001;

        // Repulsion between nodes
        for (const other of nodes) {
          if (node.id === other.id) continue;
          const dx = (node.x ?? 0) - (other.x ?? 0);
          const dy = (node.y ?? 0) - (other.y ?? 0);
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = 500 / (dist * dist);
          node.vx! += (dx / dist) * force;
          node.vy! += (dy / dist) * force;
        }
      }

      // Edge attraction
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = (t.x ?? 0) - (s.x ?? 0);
        const dy = (t.y ?? 0) - (s.y ?? 0);
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (dist - 100) * 0.005;
        s.vx! += (dx / dist) * force;
        s.vy! += (dy / dist) * force;
        t.vx! -= (dx / dist) * force;
        t.vy! -= (dy / dist) * force;
      }

      // Update positions
      for (const node of nodes) {
        node.x = Math.max(20, Math.min(w - 20, (node.x ?? 0) + (node.vx ?? 0)));
        node.y = Math.max(20, Math.min(h - 20, (node.y ?? 0) + (node.vy ?? 0)));
      }

      // Render
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      ctx.strokeStyle = "rgba(100, 100, 200, 0.2)";
      ctx.lineWidth = 1;
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        ctx.beginPath();
        ctx.moveTo(s.x ?? 0, s.y ?? 0);
        ctx.lineTo(t.x ?? 0, t.y ?? 0);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const isSelected = node.id === selectedNodeId;
        const radius = Math.max(4, Math.min(12, node.linkCount * 2 + 4));

        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#6366f1" : "#818cf8";
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "#4f46e5";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = document.documentElement.classList.contains("dark") ? "#e2e8f0" : "#1e293b";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.x ?? 0, (node.y ?? 0) + radius + 14);
      }

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, edges, selectedNodeId]);

  // Handle click
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of nodes) {
      const dx = (node.x ?? 0) - x;
      const dy = (node.y ?? 0) - y;
      const radius = Math.max(4, Math.min(12, node.linkCount * 2 + 4));
      if (Math.sqrt(dx * dx + dy * dy) < radius + 3) {
        onNodeClick(node.id);
        return;
      }
    }
  }

  if (initialNodes.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        No concepts extracted yet. Start reading and highlighting to build your knowledge graph.
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="w-full cursor-pointer rounded-xl border bg-card"
      style={{ maxHeight: 400 }}
      onClick={handleCanvasClick}
    />
  );
}
