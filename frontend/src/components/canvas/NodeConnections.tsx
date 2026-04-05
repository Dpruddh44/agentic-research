"use client";

/**
 * NodeConnections — Renders edge lines between connected knowledge nodes.
 *
 * Uses drei <Line> with vertex colors for gradient effects and
 * opacity based on connection strength.
 */

import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { PositionedNode, Connection } from "@/types";
import { CATEGORY_COLORS } from "@/types";
import * as THREE from "three";

interface NodeConnectionsProps {
  nodes: PositionedNode[];
  connections: Connection[];
}

const NodeConnectionsInner: React.FC<NodeConnectionsProps> = ({
  nodes,
  connections,
}) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const lines = useMemo(() => {
    return connections
      .map((conn) => {
        const source = nodeMap.get(conn.source_id);
        const target = nodeMap.get(conn.target_id);
        if (!source || !target) return null;

        const sourceColor =
          CATEGORY_COLORS[source.category] || CATEGORY_COLORS.general;

        return {
          key: `${conn.source_id}-${conn.target_id}`,
          positions: new Float32Array([
            ...source.position,
            ...target.position
          ]),
          color: sourceColor,
          opacity: 0.15 + conn.strength * 0.35,
        };
      })
      .filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.map>[number]>[];
  }, [connections, nodeMap]);

  return (
    <group>
      {lines.map((line) => {
        return (
          <primitive object={new THREE.Line()} key={(line as any).key}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                args={[(line as any).positions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              attach="material"
              color={(line as any).color}
              transparent
              opacity={(line as any).opacity}
              depthWrite={false}
            />
          </primitive>
        );
      })}
    </group>
  );
};

export const NodeConnections = React.memo(NodeConnectionsInner);
NodeConnections.displayName = "NodeConnections";
