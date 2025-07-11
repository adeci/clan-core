// Working SolidJS + Three.js cube scene with grid arrangement
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

  const meshMap = new Map<string, THREE.Mesh>();
  const baseMap = new Map<string, THREE.Mesh>(); // Map for cube bases

  let sharedCubeGeometry: THREE.BoxGeometry;
  let sharedBaseGeometry: THREE.BoxGeometry;

  // Used for development purposes
  // Vite does hot-reload but we need to ensure the animation loop doesn't run multiple times
  // This flag prevents multiple animation loops from running simultaneously
  // It is set to true when the component mounts and false when it unmounts
  let isAnimating = false; // Flag to prevent multiple loops
  let frameCount = 0;

  const [cubes, setCubes] = createSignal<CubeData[]>([]);
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
  const [cameraInfo, setCameraInfo] = createSignal({
    position: { x: 0, y: 0, z: 0 },
    spherical: { radius: 0, theta: 0, phi: 0 },
  });

  // Grid configuration
  const GRID_SIZE = 10;
  const CUBE_SPACING = 2;

  // Calculate grid position for a cube index with floating effect
  function getGridPosition(index: number): [number, number, number] {
    const x =
      (index % GRID_SIZE) * CUBE_SPACING - (GRID_SIZE * CUBE_SPACING) / 2;
    const z =
      Math.floor(index / GRID_SIZE) * CUBE_SPACING -
      (GRID_SIZE * CUBE_SPACING) / 2;
    return [x, 0.5, z];
  }

  // Create multi-colored cube materials for different faces
  function createCubeMaterials() {
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xb0c0c2 }), // Right face - medium
      new THREE.MeshBasicMaterial({ color: 0x4d6a6b }), // Left face - dark shadow
      new THREE.MeshBasicMaterial({ color: 0xdce4e5 }), // Top face - light
      new THREE.MeshBasicMaterial({ color: 0x4d6a6b }), // Bottom face - dark shadow
      new THREE.MeshBasicMaterial({ color: 0xb0c0c2 }), // Front face - medium
      new THREE.MeshBasicMaterial({ color: 0x4d6a6b }), // Back face - dark shadow
    ];
    return materials;
  }
  function createBaseMaterials() {
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xdce4e5 }), // Right face - medium
      new THREE.MeshBasicMaterial({ color: 0xa4b3b5 }), // Left face - dark shadow
      new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x303030 }), // Top face - light
      new THREE.MeshBasicMaterial({ color: 0xa4b3b5 }), // Bottom face - dark shadow
      new THREE.MeshBasicMaterial({ color: 0xdce4e5 }), // Front face - medium
      new THREE.MeshBasicMaterial({ color: 0xa4b3b5 }), // Back face - dark shadow
    ];
    return materials;
  }

  // Create white base for cube
  function createCubeBase(cube_pos: [number, number, number]) {
    const baseMaterials = createBaseMaterials();
    const base = new THREE.Mesh(sharedBaseGeometry, baseMaterials);
    // tranlate_y = - cube_height / 2 - base_height / 2
    base.position.set(cube_pos[0], cube_pos[1] - 0.5 - 0.025, cube_pos[2]); // Position below cube
    base.receiveShadow = true;
    return base;
  }

  // === Add/Delete Cube API ===
  function addCube() {
    const id = crypto.randomUUID();
    const currentCount = cubes().length;
    const cube: CubeData = {
      id,
      position: getGridPosition(currentCount),
      color: "blue",
    };
    setCubes((prev) => [...prev, cube]);
  }

  function deleteCube(id: string) {
    // Remove cube mesh
    const mesh = meshMap.get(id);
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      // Dispose materials properly
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
      meshMap.delete(id);
    }

    // Remove base mesh - THIS WAS MISSING!
    const base = baseMap.get(id);
    if (base) {
      scene.remove(base);
      base.geometry.dispose();
      // Dispose base materials properly
      if (Array.isArray(base.material)) {
        base.material.forEach((material) => material.dispose());
      } else {
        base.material.dispose();
      }
      baseMap.delete(id);
    }

    setCubes((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleSelection(id: string) {
    setSelectedIds((curr) => {
      const next = new Set(curr);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateMeshColors() {
    for (const [id, base] of baseMap.entries()) {
      const selected = selectedIds().has(id);
      const materials = base.material as THREE.Material[];

      if (selected) {
        // When selected, make all faces red-ish but maintain the lighting difference
        materials.forEach((material, index) => {
          (material as THREE.MeshBasicMaterial).color.set(
            index === 2
              ? 0xff6666 // Top face - lighter red
              : index === 0 || index === 4
                ? 0xdce4e5 // Front/right faces - keep
                : 0xa4b3b5, // Shadow faces - keep
          );
        });
      } else {
        // Normal colors - restore original face colors
        materials.forEach((material, index) => {
          (material as THREE.MeshBasicMaterial).color.set(
            index === 2
              ? 0xffffff // Top face - light
              : index === 0 || index === 4
                ? 0xdce4e5 // Front/right faces - medium
                : 0xa4b3b5, // Shadow faces - dark
          );
        });
      }
    }
  }

  function logMemoryUsage() {
    if (renderer && renderer.info) {
      console.log("Three.js Memory:", {
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs?.length || 0,
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      });
    }
  }

  onMount(() => {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      75,
      container!.clientWidth / container!.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(11, 8, -11);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Bright
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    // Position light at 30 degree angle (30 degrees from vertical)
    // For 30 degree angle: tan(30°) = opposite/adjacent = x/y
    // If y = 100, then x = 100 * tan(30°) = 100 * 0.577 = 57.7
    directionalLight.position.set(57.7, 100, 57.7);
    directionalLight.castShadow = true;

    // Configure shadow camera for hard, crisp shadows
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.mapSize.width = 4096; // Higher resolution for sharper shadows
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.radius = 1; // Hard shadows (low radius)
    directionalLight.shadow.blurSamples = 4; // Fewer samples for harder edges
    scene.add(directionalLight);

    // Floor/Ground - Make it invisible but keep it for reference
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0, // Make completely invisible
      visible: false, // Also hide it completely
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0; // Keep at ground level for reference
    scene.add(floor);

    // Shared geometries for cubes and bases
    // This allows us to reuse the same geometry for all cubes and bases
    sharedCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    sharedBaseGeometry = new THREE.BoxGeometry(1.2, 0.05, 1.2);

    // Basic OrbitControls implementation (simplified)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);

    // Function to update camera info
    const updateCameraInfo = () => {
      setCameraInfo({
        position: {
          x: Math.round(camera.position.x * 100) / 100,
          y: Math.round(camera.position.y * 100) / 100,
          z: Math.round(camera.position.z * 100) / 100,
        },
        spherical: {
          radius: Math.round(spherical.radius * 100) / 100,
          theta: Math.round(spherical.theta * 100) / 100,
          phi: Math.round(spherical.phi * 100) / 100,
        },
      });
    };

    // Initial camera info update
    updateCameraInfo();

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      updateCameraInfo();

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      spherical.radius += event.deltaY * 0.01;
      spherical.radius = Math.max(5, Math.min(50, spherical.radius));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      updateCameraInfo();
    };

    // Event listeners
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Raycaster for clicking
    raycaster = new THREE.Raycaster();

    // Click handler for cube selection
    const onClick = (event: MouseEvent) => {
      if (isDragging) return; // Don't select if we were dragging

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
    };

    renderer.domElement.addEventListener("click", onClick);

    const animate = () => {
      if (!isAnimating) return; // Exit if component is unmounted

      requestAnimationFrame(animate);

      frameCount++;
      renderer.render(scene, camera);

      // Uncomment for memory debugging:
      if (frameCount % 60 === 0) logMemoryUsage(); // Log every 60 frames
    };
    isAnimating = true;
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup function
    onCleanup(() => {
      // Stop animation loop
      isAnimating = false;
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);

      if (container) {
        container.innerHTML = "";
      }
    });
  });

  // Effect to manage cube meshes
  createEffect(() => {
    const existing = new Set(meshMap.keys());

    // Update existing cubes and create new ones
    cubes().forEach((cube) => {
      if (!meshMap.has(cube.id)) {
        // Create cube mesh
        const cubeMaterials = createCubeMaterials();
        const mesh = new THREE.Mesh(sharedCubeGeometry, cubeMaterials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(...cube.position);
        mesh.userData.id = cube.id;
        scene.add(mesh);
        meshMap.set(cube.id, mesh);

        // Create base mesh
        const base = createCubeBase(cube.position);
        base.userData.id = cube.id;
        scene.add(base);
        baseMap.set(cube.id, base);
      }
      existing.delete(cube.id);
    });

    // Remove cubes that are no longer in the state
    existing.forEach((id) => {
      deleteCube(id);
    });

    updateMeshColors();
  });

  // Effect to update colors when selection changes
  createEffect(() => {
    selectedIds(); // Track the signal
    updateMeshColors();
  });

  onCleanup(() => {
    for (const mesh of meshMap.values()) {
      // Handle both single material and material array
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    meshMap.clear();

    for (const mesh of baseMap.values()) {
      // Handle both single material and material array
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    baseMap.clear();

    // Dispose shared geometries
    sharedCubeGeometry?.dispose();
    sharedBaseGeometry?.dispose();

    renderer?.dispose();
  });

  return (
    <div>
      <div style={{ "margin-bottom": "10px" }}>
        <button onClick={addCube}>Add Cube</button>
        <span style={{ "margin-left": "10px" }}>
          Selected: {selectedIds().size} cubes
        </span>
      </div>

      {/* Camera Information Display */}
      <div
        style={{
          "margin-bottom": "10px",
          "font-family": "monospace",
          "font-size": "12px",
          "background-color": "#f5f5f5",
          padding: "8px",
          "border-radius": "4px",
          border: "1px solid #ddd",
        }}
      >
        <div>
          <strong>Camera Info:</strong>
        </div>
        <div>
          Position: ({cameraInfo().position.x}, {cameraInfo().position.y},{" "}
          {cameraInfo().position.z})
        </div>
        <div>
          Spherical: radius={cameraInfo().spherical.radius}, θ=
          {cameraInfo().spherical.theta}, φ={cameraInfo().spherical.phi}
        </div>
      </div>

      <div
        ref={(el) => (container = el)}
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ccc",
          cursor: "grab",
        }}
      />
    </div>
  );
}
