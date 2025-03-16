import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

interface ThreeLoadingCubeProps {
  loadingMessage?: string;
}

const ThreeLoadingCube: React.FC<ThreeLoadingCubeProps> = ({ loadingMessage }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Create a cube (box) with wireframe material for a cool effect
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x156289, wireframe: true });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // Create a group to hold our 3D text meshes, and attach it to the cube
    const textGroup = new THREE.Group();
    cube.add(textGroup);

    let font: any | null = null;
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (loadedFont) => {
      font = loadedFont;

      // Create the initial dynamic number text mesh
      const textGeometry = new TextGeometry("0", {
        font: font,
        size: 0.5,
        height: 0.1,
      });
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dynamicTextMesh = new THREE.Mesh(textGeometry, textMaterial);
      // Position the text slightly in front of the cube's front face
      dynamicTextMesh.position.set(-0.5, 0, 1.01);
      dynamicTextMesh.name = "dynamicText";
      textGroup.add(dynamicTextMesh);

      // Create a static loading message text if provided
      if (loadingMessage) {
        const loadingTextGeometry = new TextGeometry(loadingMessage, {
          font: font,
          size: 0.3,
          height: 0.05,
        });
        const loadingTextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const loadingTextMesh = new THREE.Mesh(loadingTextGeometry, loadingTextMaterial);
        // Position the loading message below the dynamic number text
        loadingTextMesh.position.set(-0.8, -0.7, 1.01);
        loadingTextMesh.name = "loadingText";
        textGroup.add(loadingTextMesh);
      }
    });

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame++;

      // Rotate the cube slowly for a dynamic effect
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      // Update the dynamic 3D number if the font has loaded
      if (font) {
        const dynamicTextMesh = textGroup.getObjectByName("dynamicText") as THREE.Mesh;
        if (dynamicTextMesh) {
          // Dispose of the old geometry
          dynamicTextMesh.geometry.dispose();
          // Create a new geometry with the updated frame count
          const newGeometry = new TextGeometry(frame.toString(), {
            font: font,
            size: 0.5,
            height: 0.1,
          });
          dynamicTextMesh.geometry = newGeometry;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current?.clientWidth || 0;
      const height = mountRef.current?.clientHeight || 0;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Clean up on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [loadingMessage]);

  // The container covers the entire area where the animation is displayed
  return <div ref={mountRef} className="w-full h-full absolute inset-0" />;
};

export default ThreeLoadingCube;
