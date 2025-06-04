// Basic setup for a SolidJS + Three.js cube scene
import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import * as THREE from "three";

// Cube Data Model
interface CubeData {
  id: string;
  position: [number, number, number];
  color: string;
}

export function CubeScene() {
  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let raycaster: THREE.Raycaster;
  let meshMap = new Map<string, THREE.Mesh>();

  const [cubes, setCubes] = createSignal<CubeData[]>([]);
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());

  // === Add/Delete Cube API ===
  function addCube() {
    const id = crypto.randomUUID();
    const cube: CubeData = {
      id,
      position: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
      color: "blue",
    };
    setCubes((prev) => [...prev, cube]);
  }

  function deleteCube(id: string) {
    setCubes((prev) => prev.filter((c) => c.id !== id));
    const mesh = meshMap.get(id);
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      meshMap.delete(id);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateMeshColors() {
    for (const [id, mesh] of meshMap.entries()) {
      const selected = selectedIds().has(id);
      (mesh.material as THREE.MeshBasicMaterial).color.set(
        // Some selection color
        selected ? "red" : "blue",
      );
    }
  }

  onMount(() => {
    scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container!.clientWidth / container!.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(5 * 2, 6 * 2, 5 * 2); // from above and to the side
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Transparent background
    renderer.setClearColor(0x000000, 0);
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Click handler
    renderer.domElement.addEventListener("click", (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        Array.from(meshMap.values()),
      );
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.id;
        toggleSelection(id);
      }
    });
  });

  createEffect(() => {
    const existing = new Set(meshMap.keys());
    // Update existing cubes
    cubes().forEach((cube) => {
      // If the cube NOT already exists
      if (!meshMap.has(cube.id)) {
        const cubeGeometry = new THREE.BoxGeometry();
        const cubeMaterial = new THREE.MeshStandardMaterial({
          color: 0xb0c0c2,
          roughness: 0.4,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        mesh.castShadow = true;
        mesh.position.y = 1;
        mesh.position.set(...cube.position);
        mesh.userData.id = cube.id;
        scene.add(mesh);
        meshMap.set(cube.id, mesh);
      }
      // Keep track of existing cubes
      existing.delete(cube.id);
    });
    // Remaining cubes in `existing` are cubes to delete
    // since they are not present in the current `cubes` state
    existing.forEach((id) => {
      deleteCube(id);
    });

    updateMeshColors();
  });

  onCleanup(() => {
    renderer.dispose();
    for (const mesh of meshMap.values()) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    meshMap.clear();
  });

  return (
    <div>
      <button onClick={addCube}>Add Cube</button>
      <div
        ref={(el) => (container = el)}
        style={{ width: "100%", height: "500px" }}
      />
    </div>
  );
}
