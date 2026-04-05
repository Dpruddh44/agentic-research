/**
 * 3D Force-Directed Graph Layout Algorithm
 *
 * Computes optimal 3D positions for research nodes using a simplified
 * force-directed layout with repulsion between all nodes and attraction
 * along connections.
 */

import type { Vector3Tuple } from "three";
import type { ResearchNode, Connection, PositionedNode } from "@/types";

interface LayoutConfig {
  /** Repulsion force between nodes */
  repulsion: number;
  /** Attraction force along connections */
  attraction: number;
  /** Number of simulation iterations */
  iterations: number;
  /** Spread radius for initial positioning */
  spread: number;
  /** Damping factor to stabilize simulation */
  damping: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  repulsion: 80,
  attraction: 0.02,
  iterations: 100,
  spread: 12,
  damping: 0.92,
};

/**
 * Compute 3D positions for research nodes using force-directed layout.
 *
 * Places nodes in 3D space where:
 * - Connected nodes attract each other
 * - All nodes repel each other (to prevent overlap)
 * - Relevance score influences vertical position (more relevant = higher)
 */
export function computeGraphLayout(
  nodes: ResearchNode[],
  connections: Connection[],
  config: Partial<LayoutConfig> = {},
): PositionedNode[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ ...nodes[0], position: [0, 0, 0] }];
  }

  // Initialize positions using golden ratio sphere distribution
  const positions: [number, number, number][] = nodes.map((_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / nodes.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = cfg.spread * (0.5 + Math.random() * 0.5);

    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.6, // Compress Y axis slightly
      r * Math.sin(phi) * Math.sin(theta),
    ];
  });

  // Build adjacency lookup
  const connectionMap = new Map<string, Set<number>>();
  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((node, i) => nodeIndexMap.set(node.id, i));

  for (const conn of connections) {
    const srcIdx = nodeIndexMap.get(conn.source_id);
    const tgtIdx = nodeIndexMap.get(conn.target_id);
    if (srcIdx !== undefined && tgtIdx !== undefined) {
      if (!connectionMap.has(conn.source_id)) {
        connectionMap.set(conn.source_id, new Set());
      }
      if (!connectionMap.has(conn.target_id)) {
        connectionMap.set(conn.target_id, new Set());
      }
      connectionMap.get(conn.source_id)!.add(tgtIdx);
      connectionMap.get(conn.target_id)!.add(srcIdx);
    }
  }

  // Run force simulation
  const velocities: [number, number, number][] = nodes.map(() => [0, 0, 0]);

  for (let iter = 0; iter < cfg.iterations; iter++) {
    const forces: [number, number, number][] = nodes.map(() => [0, 0, 0]);

    // Repulsion (Coulomb's law, all pairs)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = positions[i][0] - positions[j][0];
        const dy = positions[i][1] - positions[j][1];
        const dz = positions[i][2] - positions[j][2];
        const distSq = dx * dx + dy * dy + dz * dz + 0.01; // Avoid division by zero
        const dist = Math.sqrt(distSq);
        const force = cfg.repulsion / distSq;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;

        forces[i][0] += fx;
        forces[i][1] += fy;
        forces[i][2] += fz;
        forces[j][0] -= fx;
        forces[j][1] -= fy;
        forces[j][2] -= fz;
      }
    }

    // Attraction (Hooke's law, along connections)
    for (const conn of connections) {
      const srcIdx = nodeIndexMap.get(conn.source_id);
      const tgtIdx = nodeIndexMap.get(conn.target_id);
      if (srcIdx === undefined || tgtIdx === undefined) continue;

      const dx = positions[tgtIdx][0] - positions[srcIdx][0];
      const dy = positions[tgtIdx][1] - positions[srcIdx][1];
      const dz = positions[tgtIdx][2] - positions[srcIdx][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.01);

      const force = cfg.attraction * dist * conn.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;

      forces[srcIdx][0] += fx;
      forces[srcIdx][1] += fy;
      forces[srcIdx][2] += fz;
      forces[tgtIdx][0] -= fx;
      forces[tgtIdx][1] -= fy;
      forces[tgtIdx][2] -= fz;
    }

    // Apply forces with damping
    const damping = cfg.damping * (1 - iter / cfg.iterations * 0.5);
    for (let i = 0; i < nodes.length; i++) {
      velocities[i][0] = (velocities[i][0] + forces[i][0]) * damping;
      velocities[i][1] = (velocities[i][1] + forces[i][1]) * damping;
      velocities[i][2] = (velocities[i][2] + forces[i][2]) * damping;

      positions[i][0] += velocities[i][0];
      positions[i][1] += velocities[i][1];
      positions[i][2] += velocities[i][2];
    }
  }

  // Adjust Y position based on relevance (more relevant = higher)
  for (let i = 0; i < nodes.length; i++) {
    positions[i][1] += (nodes[i].relevance - 0.5) * 4;
  }

  // Center the graph
  const center: [number, number, number] = [0, 0, 0];
  for (const pos of positions) {
    center[0] += pos[0];
    center[1] += pos[1];
    center[2] += pos[2];
  }
  center[0] /= nodes.length;
  center[1] /= nodes.length;
  center[2] /= nodes.length;

  return nodes.map((node, i): PositionedNode => ({
    ...node,
    position: [
      positions[i][0] - center[0],
      positions[i][1] - center[1],
      positions[i][2] - center[2],
    ] as Vector3Tuple,
  }));
}
