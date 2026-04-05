"use client";

/**
 * ResearchCanvas — The main R3F Canvas with WebGPU renderer.
 *
 * Renders the 3D knowledge graph with interactive nodes, connection
 * edges, ambient space environment, and camera controls.
 * Wrapped in CanvasErrorBoundary for graceful 2D fallback.
 */

import React, { useRef, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { KnowledgeNode } from "./KnowledgeNode";
import { NodeConnections } from "./NodeConnections";
import { CameraController, type CameraControllerHandle } from "./CameraController";
import type { PositionedNode, Connection } from "@/types";

interface ResearchCanvasProps {
  nodes: PositionedNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  fallback: React.ReactNode;
}

// Loading component shown while canvas initializes
function CanvasLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color="#06d6f2"
        emissive="#06d6f2"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// Background stars and ambient lighting
function Environment() {
  const starsArray = React.useMemo(() => {
    // Generate 3000 random points for stars
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) {
      p[i] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#e0f0ff" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#a855f7" />
      <pointLight position={[0, 15, 0]} intensity={0.2} color="#06d6f2" />
      
      {/* WebGPU compatible standard points instead of ShaderMaterial Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starsArray, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.4} sizeAttenuation={true} color="#ffffff" transparent opacity={0.6} depthWrite={false} />
      </points>

      {/* Subtle fog for depth perception */}
      <fog attach="fog" args={["#030712", 20, 80]} />
    </>
  );
}

export const ResearchCanvas: React.FC<ResearchCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  fallback,
}) => {
  const cameraRef = useRef<CameraControllerHandle>(null);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);

      // Fly camera to the selected node
      const node = nodes.find((n) => n.id === nodeId);
      if (node && cameraRef.current) {
        cameraRef.current.focusNode(node.position);
      }
    },
    [nodes, onSelectNode],
  );

  // Click on empty space to deselect
  const handleCanvasClick = useCallback(() => {
    onSelectNode(null);
    if (cameraRef.current) {
      cameraRef.current.resetCamera();
    }
  }, [onSelectNode]);

  // Attempt WebGPU first, gracefully fall back to WebGL2
  const glCreator = async (props: any) => {
    const canvas = props.canvas as HTMLCanvasElement;
    
    try {
      const { WebGPURenderer } = await import("three/webgpu");
      const renderer = new WebGPURenderer({
        ...props,
        canvas,
        antialias: true,
      });
      await renderer.init();
      console.info("✓ Using WebGPU renderer");
      return renderer;
    } catch {
      // WebGPU not available — fall back to standard WebGL2 renderer
      console.warn("WebGPU unavailable, falling back to WebGL2 renderer");
      const { WebGLRenderer } = await import("three");
      const renderer = new WebGLRenderer({
        ...props,
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      return renderer;
    }
  };

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <div id="research-canvas" className="canvas-container">
        <Canvas
          gl={glCreator as any}
          camera={{
            position: [0, 8, 22],
            fov: 50,
            near: 0.1,
            far: 200,
          }}
          onPointerMissed={handleCanvasClick}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <Environment />

            {/* Knowledge Graph Nodes */}
            {nodes.map((node) => (
              <KnowledgeNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={handleSelectNode}
              />
            ))}

            {/* Connection Edges */}
            <NodeConnections nodes={nodes} connections={connections} />

            {/* Camera Controls */}
            <CameraController ref={cameraRef} />

            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
};
