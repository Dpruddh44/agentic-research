"use client";

/**
 * useCameraTransition — GSAP-powered camera staging for the 3D canvas.
 *
 * Provides smooth camera fly-to transitions with OrbitControls management.
 * Uses @gsap/react for proper lifecycle cleanup.
 */

import { useCallback, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Vector3Tuple } from "three";
import type { CameraTarget } from "@/types";

interface UseCameraTransitionOptions {
  /** Duration of the camera transition in seconds */
  duration?: number;
  /** GSAP easing function */
  ease?: string;
}

interface UseCameraTransitionReturn {
  /** Fly camera to a target position/lookAt */
  transitionTo: (target: CameraTarget) => void;
  /** Reset camera to the default overview position */
  resetCamera: () => void;
  /** Whether a camera animation is currently playing */
  isAnimating: boolean;
}

/** Default camera overview position */
const DEFAULT_CAMERA: CameraTarget = {
  position: [0, 8, 22],
  lookAt: [0, 0, 0],
};

/** Position offset when focusing on a node (slightly above and behind) */
const NODE_FOCUS_OFFSET: Vector3Tuple = [3, 2, 5];

export function useCameraTransition(
  controlsRef: React.RefObject<OrbitControlsImpl | null>,
  options: UseCameraTransitionOptions = {},
): UseCameraTransitionReturn {
  const { duration = 1.8, ease = "power2.inOut" } = options;
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const transitionTo = useCallback(
    (target: CameraTarget) => {
      // Kill any existing animation
      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      // Disable orbit controls during animation
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      setIsAnimating(true);

      // Animate camera position
      tweenRef.current = gsap.to(camera.position, {
        x: target.position[0],
        y: target.position[1],
        z: target.position[2],
        duration,
        ease,
        onUpdate: () => {
          camera.lookAt(
            target.lookAt[0],
            target.lookAt[1],
            target.lookAt[2],
          );

          // Update orbit controls target during animation
          if (controlsRef.current) {
            controlsRef.current.target.set(
              target.lookAt[0],
              target.lookAt[1],
              target.lookAt[2],
            );
          }
        },
        onComplete: () => {
          setIsAnimating(false);
          // Re-enable orbit controls after animation
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.update();
          }
        },
      });
    },
    [camera, controlsRef, duration, ease],
  );

  const resetCamera = useCallback(() => {
    transitionTo(DEFAULT_CAMERA);
  }, [transitionTo]);

  return { transitionTo, resetCamera, isAnimating };
}

/**
 * Compute a camera target for focusing on a specific node.
 */
export function getNodeFocusTarget(nodePosition: Vector3Tuple): CameraTarget {
  return {
    position: [
      nodePosition[0] + NODE_FOCUS_OFFSET[0],
      nodePosition[1] + NODE_FOCUS_OFFSET[1],
      nodePosition[2] + NODE_FOCUS_OFFSET[2],
    ],
    lookAt: nodePosition,
  };
}
