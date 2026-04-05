"use client";

/**
 * KnowledgeNode — Memoized 3D node for the knowledge graph.
 *
 * Renders as a glowing sphere with Float animation and Html labels.
 * Uses React.memo to prevent re-render jitter in the R3F loop.
 */

import React, { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial } from "three";
import type { PositionedNode } from "@/types";
import { CATEGORY_COLORS } from "@/types";

interface KnowledgeNodeProps {
  node: PositionedNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
}

const KnowledgeNodeInner: React.FC<KnowledgeNodeProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general;
  const baseScale = 0.3 + node.relevance * 0.5;
  const targetScale = hovered || isSelected ? baseScale * 1.3 : baseScale;

  // Smooth scale animation in the render loop
  useFrame((_, delta) => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * Math.min(delta * 8, 1);
      meshRef.current.scale.setScalar(newScale);
    }

    // Animate emissive intensity
    if (materialRef.current) {
      const targetIntensity = hovered || isSelected ? 0.6 : 0.2;
      materialRef.current.emissiveIntensity +=
        (targetIntensity - materialRef.current.emissiveIntensity) *
        Math.min(delta * 6, 1);
    }
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(node.id);
    },
    [node.id, onSelect],
  );

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
    },
    [],
  );

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.1}
      floatIntensity={0.3}
      floatingRange={[-0.1, 0.1]}
    >
      <group position={node.position}>
        {/* Main sphere */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          scale={baseScale}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Outer glow ring */}
        <mesh scale={baseScale * 1.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={hovered || isSelected ? 0.08 : 0.03}
            depthWrite={false}
          />
        </mesh>

        {/* HTML Label */}
        <Html
          position={[0, baseScale * 1.5 + 0.5, 0]}
          center
          distanceFactor={15}
          sprite
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: isSelected ? 600 : 400,
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              opacity: hovered || isSelected ? 1 : 0.7,
              transition: "opacity 0.3s ease",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.title}
          </div>
        </Html>
      </group>
    </Float>
  );
};

export const KnowledgeNode = React.memo(KnowledgeNodeInner);
KnowledgeNode.displayName = "KnowledgeNode";
