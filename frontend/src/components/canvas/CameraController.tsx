"use client";

/**
 * CameraController — Manages OrbitControls and GSAP camera staging.
 *
 * Holds the OrbitControls ref and exposes transition control
 * to parent components via callback ref pattern.
 */

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useCameraTransition, getNodeFocusTarget } from "@/hooks/useCameraTransition";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Vector3Tuple } from "three";

export interface CameraControllerHandle {
  focusNode: (position: Vector3Tuple) => void;
  resetCamera: () => void;
  isAnimating: boolean;
}

const CameraControllerInner = forwardRef<CameraControllerHandle>(
  function CameraControllerInner(_, ref) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { transitionTo, resetCamera, isAnimating } =
      useCameraTransition(controlsRef);

    useImperativeHandle(
      ref,
      () => ({
        focusNode: (position: Vector3Tuple) => {
          const target = getNodeFocusTarget(position);
          transitionTo(target);
        },
        resetCamera,
        isAnimating,
      }),
      [transitionTo, resetCamera, isAnimating],
    );

    return (
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.85}
      />
    );
  },
);

export const CameraController = React.memo(CameraControllerInner);
CameraController.displayName = "CameraController";
