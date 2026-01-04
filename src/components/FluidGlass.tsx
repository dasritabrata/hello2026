/* eslint-disable react/no-unknown-property */
"use client";

import * as THREE from "three";
import { Suspense } from "react";

import { useRef, useState, useEffect, memo, ReactNode } from "react";
import {
  Canvas,
  createPortal,
  useFrame,
  useThree,
  ThreeElements,
} from "@react-three/fiber";
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text,
} from "@react-three/drei";
import { easing } from "maath";

/* -------------------------------- types -------------------------------- */

type Mode = "lens" | "bar" | "cube";

interface NavItem {
  label: string;
  link: string;
}

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: ModeProps;
  barProps?: ModeProps;
  cubeProps?: ModeProps;
}

/* ----------------------------- main component ---------------------------- */

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  barProps = {},
  cubeProps = {},
}: FluidGlassProps) {
  const Wrapper = mode === "bar" ? Bar : mode === "cube" ? Cube : Lens;
  const rawOverrides =
    mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;

  const {
    navItems = [
      { label: "Home", link: "#home" },
      { label: "About", link: "#about" },
      { label: "Contact", link: "#contact" },
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
  {mode === "bar" && <NavItems items={navItems as NavItem[]} />}

  <Suspense fallback={null}>
    <Wrapper modeProps={modeProps}>
      <Scroll>
        <Typography />
        <Images />
      </Scroll>
      <Preload />
    </Wrapper>
  </Suspense>
</ScrollControls>

      </Canvas>
    </div>
  );
}

/* ---------------------------- shared wrapper ----------------------------- */

type MeshProps = ThreeElements["mesh"];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current =
      geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const x = followPointer ? (pointer.x * v.width) / 2 : 0;
    const y = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
      ? (pointer.y * v.height) / 2
      : 0;

    easing.damp3(ref.current.position, [x, y, 15], 0.15, delta);

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const {
    scale,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps as any;

  return (
    <>
      {createPortal(children, scene)}

      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>

      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

/* ------------------------------ modes ----------------------------------- */

function Lens({ modeProps, ...p }: any) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({ modeProps, ...p }: any) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({ modeProps = {}, ...p }: any) {
  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={modeProps}
      {...p}
    />
  );
}

/* ------------------------------ nav text -------------------------------- */

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();

  useFrame(() => {
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);
    group.current.children.forEach((c, i) => {
      c.position.x = (i - (items.length - 1) / 2) * 0.3;
    });
  });

  return (
    <group ref={group}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={0.045}
          color="white"
          onClick={() => (window.location.href = link)}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

/* ------------------------------ images ---------------------------------- */

function Images() {
  const group = useRef<any>(null);
  const scroll = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    group.current.children.forEach((img: any, i: number) => {
      img.material.zoom = 1 + scroll.range(i / 5, 1 / 5);
    });
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url="/assets/demo/cs1.webp" />
      <Image position={[2, 0, 3]} scale={3} url="/assets/demo/cs2.webp" />
      <Image position={[-2, -height, 6]} scale={[1, 3]} url="/assets/demo/cs3.webp" />
    </group>
  );
}

/* ------------------------------ title ----------------------------------- */

function Typography() {
  return (
    <Text position={[0, 0, 12]} fontSize={0.6} color="white">
      React Bits
    </Text>
  );
}
