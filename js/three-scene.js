/**
 * Khayoon Alaayedi — Three.js Celestial Mechanics Scene
 * Implements an evolving 3D space ecosystem with an interactive Earth/celestial globe,
 * orbital trajectories, satellite nodes, starfield, and scroll-choreographed transformations.
 */

export class CelestialScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;

    // Core objects
    this.starfield = null;
    this.globeGroup = null;
    this.earthMesh = null;
    this.atmosphereMesh = null;
    this.orbitalGroup = null;
    this.nodesGroup = null;
    this.constellationPoints = null;

    // Movement & state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.isReducedMotion = false;
    this.isMobile = false;

    // Scroll chapter definitions (scroll fractions: 0.0 to 1.0)
    this.chapters = [
      { id: 'hero', targetRotY: 0, targetPos: { x: 2.2, y: -0.2, z: 0 }, scale: 1.0, orbitTilt: 0.3 },
      { id: 'about', targetRotY: 0.8, targetPos: { x: -1.8, y: 0.1, z: 0.5 }, scale: 1.15, orbitTilt: 0.4 },
      { id: 'education', targetRotY: 1.6, targetPos: { x: 2.0, y: -0.3, z: 0.2 }, scale: 0.95, orbitTilt: 0.6 },
      { id: 'experience', targetRotY: 2.4, targetPos: { x: -2.0, y: 0.2, z: 0.1 }, scale: 1.05, orbitTilt: 0.5 },
      { id: 'skills', targetRotY: 3.2, targetPos: { x: 0, y: -1.2, z: -1.5 }, scale: 1.3, orbitTilt: 0.8 },
      { id: 'projects', targetRotY: 4.0, targetPos: { x: 2.2, y: 0.2, z: 0 }, scale: 1.1, orbitTilt: 0.4 },
      { id: 'leadership', targetRotY: 4.8, targetPos: { x: -2.0, y: -0.2, z: 0.2 }, scale: 1.05, orbitTilt: 0.55 },
      { id: 'space', targetRotY: 5.6, targetPos: { x: 0, y: 0.3, z: 1.0 }, scale: 1.25, orbitTilt: 0.75 },
      { id: 'impact', targetRotY: 6.4, targetPos: { x: -1.8, y: 0.1, z: 0.4 }, scale: 1.15, orbitTilt: 0.45 },
      { id: 'achievements', targetRotY: 7.2, targetPos: { x: 2.0, y: -0.2, z: 0.1 }, scale: 1.0, orbitTilt: 0.5 },
      { id: 'contact', targetRotY: 8.0, targetPos: { x: 0, y: -0.8, z: -0.5 }, scale: 0.85, orbitTilt: 0.25 }
    ];

    this.init();
  }

  async init() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;

    // Dynamically load Three.js via vendor route or CDN fallback
    let THREE;
    try {
      THREE = await import('/vendor/three.module.js');
    } catch (e) {
      console.warn('Loading Three.js from CDN fallback...');
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    }
    this.THREE = THREE;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070709, 0.05);

    // 2. Camera Setup
    const fov = this.isMobile ? 65 : 50;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Build 3D Entities
    this.createStarfield();
    this.createCelestialBody();
    this.createOrbitalSystem();
    this.createConstellationNodes();

    // 5. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x222630, 1.5);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(12, 10, 8);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-10, -5, -4);
    this.scene.add(rimLight);

    // 6. Event Listeners
    this.bindEvents();

    // 7. Start Animation Loop
    this.animate(0);
  }

  createStarfield() {
    const THREE = this.THREE;
    const count = this.isMobile ? 800 : 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute stars in spherical volume
      const radius = 20 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Subtle monochromatic star color variations (white, soft silver, starlight cyan)
      const colorType = Math.random();
      if (colorType > 0.85) {
        colors[i3] = 0.75;
        colors[i3 + 1] = 0.88;
        colors[i3 + 2] = 1.0; // Starlight ice blue
      } else if (colorType > 0.7) {
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.95;
        colors[i3 + 2] = 0.9; // Soft warm silver
      } else {
        colors[i3] = 1.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 1.0; // Crisp pure white
      }

      sizes[i] = Math.random() * 2.2 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom point material with soft circular shape
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.5,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createCelestialBody() {
    const THREE = this.THREE;
    this.globeGroup = new THREE.Group();

    // 1. Procedural High-Contrast Earth / Celestial Sphere with Land & Ocean relief
    const radius = 2.0;
    const segments = this.isMobile ? 36 : 64;
    const globeGeometry = new THREE.SphereGeometry(radius, segments, segments);

    // Procedural canvas generating Earth-like continental silhouettes & latitude grids
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 1024;
    texCanvas.height = 512;
    const tctx = texCanvas.getContext('2d');

    // Deep space ocean
    tctx.fillStyle = '#080a10';
    tctx.fillRect(0, 0, 1024, 512);

    // Continental shapes (stylized geometric land masses representing Earth continents)
    tctx.fillStyle = '#1c2230';
    tctx.beginPath();
    // Eurasia & Africa approximation
    tctx.ellipse(550, 180, 130, 80, 0.2, 0, Math.PI * 2);
    tctx.fill();
    tctx.beginPath();
    tctx.ellipse(540, 310, 80, 100, 0.1, 0, Math.PI * 2);
    tctx.fill();
    // Middle East & Iraq focal coordinate
    tctx.fillStyle = '#2d384e';
    tctx.beginPath();
    tctx.arc(580, 210, 28, 0, Math.PI * 2);
    tctx.fill();
    // Americas
    tctx.fillStyle = '#1c2230';
    tctx.beginPath();
    tctx.ellipse(230, 170, 90, 80, -0.2, 0, Math.PI * 2);
    tctx.fill();
    tctx.beginPath();
    tctx.ellipse(280, 340, 70, 100, 0.2, 0, Math.PI * 2);
    tctx.fill();
    // Australia & East Asia
    tctx.beginPath();
    tctx.ellipse(820, 360, 60, 45, 0, 0, Math.PI * 2);
    tctx.fill();
    tctx.beginPath();
    tctx.ellipse(780, 190, 80, 60, -0.3, 0, Math.PI * 2);
    tctx.fill();

    // Subtle coordinate latitude / longitude grid lines
    tctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    tctx.lineWidth = 1;
    for (let y = 32; y < 512; y += 48) {
      tctx.beginPath();
      tctx.moveTo(0, y);
      tctx.lineTo(1024, y);
      tctx.stroke();
    }
    for (let x = 64; x < 1024; x += 64) {
      tctx.beginPath();
      tctx.moveTo(x, 0);
      tctx.lineTo(x, 512);
      tctx.stroke();
    }

    const globeTexture = new THREE.CanvasTexture(texCanvas);
    globeTexture.wrapS = THREE.RepeatWrapping;
    globeTexture.wrapT = THREE.ClampToEdgeWrapping;

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.7,
      metalness: 0.25,
      color: 0x94a3b8
    });

    this.earthMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    this.globeGroup.add(this.earthMesh);

    // 2. Wireframe / Latitude Ring Overlay for scientific satellite aesthetic
    const wireGeo = new THREE.SphereGeometry(radius * 1.008, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.globeGroup.add(wireMesh);

    // 3. Glowing Atmospheric Shell
    const atmosGeo = new THREE.SphereGeometry(radius * 1.15, segments, segments);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.4, 0.65, 0.95, 1.0) * intensity * 0.75;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.globeGroup.add(this.atmosphereMesh);

    // Initial position on the right of the Hero section
    this.globeGroup.position.set(2.2, -0.2, 0);
    this.scene.add(this.globeGroup);
  }

  createOrbitalSystem() {
    const THREE = this.THREE;
    this.orbitalGroup = new THREE.Group();

    // Create 3 distinct orbital trajectories around the planet
    const orbitConfigs = [
      { radiusX: 3.2, radiusY: 3.0, tiltX: 0.4, tiltZ: 0.3, speed: 0.45, color: 0x38bdf8 },
      { radiusX: 4.0, radiusY: 3.6, tiltX: -0.6, tiltZ: -0.5, speed: -0.35, color: 0x94a3b8 },
      { radiusX: 4.8, radiusY: 4.4, tiltX: 0.8, tiltZ: -0.2, speed: 0.25, color: 0x818cf8 }
    ];

    this.orbits = [];

    orbitConfigs.forEach((cfg) => {
      // 1. Orbital path line
      const points = [];
      const steps = 128;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * cfg.radiusX,
          0,
          Math.sin(theta) * cfg.radiusY
        ));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.22
      });
      const orbitLine = new THREE.Line(curveGeo, curveMat);
      orbitLine.rotation.x = cfg.tiltX;
      orbitLine.rotation.z = cfg.tiltZ;
      this.orbitalGroup.add(orbitLine);

      // 2. Satellite / Celestial probe probe along this trajectory
      const probeGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const probeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const probeMesh = new THREE.Mesh(probeGeo, probeMat);

      // Probe halo ring
      const haloGeo = new THREE.RingGeometry(0.12, 0.16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      probeMesh.add(haloMesh);

      this.orbitalGroup.add(probeMesh);

      this.orbits.push({
        config: cfg,
        line: orbitLine,
        probe: probeMesh,
        angle: Math.random() * Math.PI * 2
      });
    });

    this.globeGroup.add(this.orbitalGroup);
  }

  createConstellationNodes() {
    const THREE = this.THREE;
    this.nodesGroup = new THREE.Group();

    // Floating data nodes for Projects / Skills sections
    const nodeCount = this.isMobile ? 18 : 36;
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);

    this.floatingNodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 8 - 2;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      this.floatingNodes.push({
        x, y, z,
        originX: x, originY: y, originZ: z,
        vx: (Math.random() - 0.5) * 0.005,
        vy: (Math.random() - 0.5) * 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.constellationPoints = new THREE.Points(nodeGeometry, nodeMat);
    this.nodesGroup.add(this.constellationPoints);
    this.scene.add(this.nodesGroup);
  }

  bindEvents() {
    // Mouse movement parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Touch movement for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    // Scroll handling
    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }, { passive: true });

    // Initial scroll calculation
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    this.scrollProgress = this.targetScrollProgress;
  }

  onWindowResize() {
    if (!this.renderer || !this.camera) return;

    this.isMobile = window.innerWidth < 768;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = this.isMobile ? 65 : 50;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adjust globe position for mobile vs desktop
    if (this.isMobile && this.globeGroup) {
      this.chapters[0].targetPos = { x: 0, y: 1.6, z: -1.2 };
      this.chapters[0].scale = 0.75;
    } else if (this.globeGroup) {
      this.chapters[0].targetPos = { x: 2.2, y: -0.2, z: 0 };
      this.chapters[0].scale = 1.0;
    }
  }

  // Smooth linear interpolation helper
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  animate(time) {
    this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

    const tSec = time * 0.001;

    // 1. Smoothly interpolate mouse parallax and scroll position
    this.mouse.x = this.lerp(this.mouse.x, this.mouse.targetX, 0.05);
    this.mouse.y = this.lerp(this.mouse.y, this.mouse.targetY, 0.05);
    this.scrollProgress = this.lerp(this.scrollProgress, this.targetScrollProgress, 0.08);

    // 2. Camera slight mouse tilt
    if (!this.isReducedMotion) {
      this.camera.position.x = this.mouse.x * 0.4;
      this.camera.position.y = this.mouse.y * 0.3;
      this.camera.lookAt(0, 0, 0);
    }

    // 3. Rotate Starfield very slowly
    if (this.starfield && !this.isReducedMotion) {
      this.starfield.rotation.y = tSec * 0.015;
      this.starfield.rotation.x = tSec * 0.008;
    }

    // 4. Update Celestial Globe Position & Scale based on Scroll Chapters
    if (this.globeGroup) {
      const numChapters = this.chapters.length;
      const progressScaled = this.scrollProgress * (numChapters - 1);
      const indexA = Math.min(Math.floor(progressScaled), numChapters - 2);
      const indexB = indexA + 1;
      const chapterFactor = Math.max(0, Math.min(1, progressScaled - indexA));

      const chA = this.chapters[indexA];
      const chB = this.chapters[indexB];

      // Interpolate target position
      const targetX = this.lerp(chA.targetPos.x, chB.targetPos.x, chapterFactor);
      const targetY = this.lerp(chA.targetPos.y, chB.targetPos.y, chapterFactor);
      const targetZ = this.lerp(chA.targetPos.z, chB.targetPos.z, chapterFactor);
      const targetScale = this.lerp(chA.scale, chB.scale, chapterFactor);

      this.globeGroup.position.x = this.lerp(this.globeGroup.position.x, targetX, 0.06);
      this.globeGroup.position.y = this.lerp(this.globeGroup.position.y, targetY, 0.06);
      this.globeGroup.position.z = this.lerp(this.globeGroup.position.z, targetZ, 0.06);

      const currentScale = this.lerp(this.globeGroup.scale.x, targetScale, 0.06);
      this.globeGroup.scale.set(currentScale, currentScale, currentScale);

      // Continuous axial rotation of the globe
      if (!this.isReducedMotion) {
        this.earthMesh.rotation.y += 0.004;
      }
      this.earthMesh.rotation.x = 0.25; // Earth axial tilt ~23.5 degrees
    }

    // 5. Update Orbiting Satellite Probes
    if (this.orbits && !this.isReducedMotion) {
      this.orbits.forEach((orbit) => {
        orbit.angle += orbit.config.speed * 0.02;
        const x = Math.cos(orbit.angle) * orbit.config.radiusX;
        const z = Math.sin(orbit.angle) * orbit.config.radiusY;

        // Apply orbital tilt transformation to probe position
        const cosX = Math.cos(orbit.config.tiltX);
        const sinX = Math.sin(orbit.config.tiltX);
        const cosZ = Math.cos(orbit.config.tiltZ);
        const sinZ = Math.sin(orbit.config.tiltZ);

        // Vector tilted
        const tiltedY = -z * sinX;
        const tiltedZ = z * cosX;
        const finalX = x * cosZ - tiltedY * sinZ;
        const finalY = x * sinZ + tiltedY * cosZ;

        orbit.probe.position.set(finalX, finalY, tiltedZ);
      });
    }

    // 6. Update Constellation Nodes
    if (this.constellationPoints && !this.isReducedMotion) {
      const positions = this.constellationPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.floatingNodes.length; i++) {
        const node = this.floatingNodes[i];
        const idx = i * 3;
        node.phase += 0.01;
        positions[idx] = node.originX + Math.sin(node.phase) * 0.3;
        positions[idx + 1] = node.originY + Math.cos(node.phase) * 0.3;
      }
      this.constellationPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 7. Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
