
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./global-threat-map.css";

const incidents = [
  { id: 1, place: "New Delhi, India", category: "Digital payment fraud", severity: "High", lat: 28.6139, lon: 77.209 },
  { id: 2, place: "Mumbai, India", category: "Phishing messages", severity: "Medium", lat: 19.076, lon: 72.8777 },
  { id: 3, place: "London, United Kingdom", category: "Online impersonation", severity: "High", lat: 51.5072, lon: -0.1276 },
  { id: 4, place: "Singapore", category: "Suspicious links", severity: "Medium", lat: 1.3521, lon: 103.8198 },
  { id: 5, place: "Tokyo, Japan", category: "Fake shopping websites", severity: "High", lat: 35.6762, lon: 139.6503 },
  { id: 6, place: "Sydney, Australia", category: "Impersonation scams", severity: "Medium", lat: -33.8688, lon: 151.2093 },
  { id: 7, place: "Dubai, UAE", category: "Payment request scams", severity: "High", lat: 25.2048, lon: 55.2708 },
  { id: 8, place: "New York, USA", category: "Account phishing", severity: "Medium", lat: 40.7128, lon: -74.006 },
];

function positionOnSphere(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function GlobalThreatMap() {
  const mountRef = useRef(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(incidents[0]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    scene.add(globe);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 64, 48),
      new THREE.MeshPhongMaterial({
        color: 0x123e68,
        emissive: 0x061c35,
        shininess: 30,
      })
    );
    globe.add(earth);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.195, 36, 24),
      new THREE.MeshBasicMaterial({
        color: 0x3999ef,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    );
    globe.add(wire);

    scene.add(new THREE.AmbientLight(0x9ecfff, 2));

    const light = new THREE.PointLight(0x4cbaff, 45);
    light.position.set(-3, 2, 4);
    scene.add(light);

    const markerMeshes = [];

    incidents.forEach((incident) => {
      const color = incident.severity === "High" ? 0xff555d : 0xffa34d;

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 16, 12),
        new THREE.MeshBasicMaterial({ color })
      );

      marker.position.copy(positionOnSphere(incident.lat, incident.lon, 1.22));
      marker.userData.incident = incident;
      globe.add(marker);
      markerMeshes.push(marker);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 12, 10),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.17,
          depthWrite: false,
        })
      );

      glow.position.copy(marker.position);
      globe.add(glow);
    });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < 300; i += 1) {
      starPositions.push(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -1 - Math.random() * 5
      );
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    scene.add(
      new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({ color: 0x8bb9e8, size: 0.016 })
      )
    );

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getMarker = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(markerMeshes)[0]?.object ?? null;
    };

    const onClick = (event) => {
      const marker = getMarker(event);
      if (marker) setSelected(marker.userData.incident);
    };

    const onMove = (event) => {
      const marker = getMarker(event);
      renderer.domElement.style.cursor = marker ? "pointer" : "grab";

      if (marker) setSelected((current) =>
        current.id === marker.userData.incident.id
          ? current
          : marker.userData.incident
      );
    };

    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("pointermove", onMove);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame;

    const animate = () => {
      frame = requestAnimationFrame(animate);

      if (!pausedRef.current) {
        globe.rotation.y += 0.0015;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("pointermove", onMove);

      scene.traverse((object) => {
        object.geometry?.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material?.dispose();
        }
      });

      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return (
    <section className="global-intel">
      <header className="global-intel-heading">
        <span className="global-kicker">GLOBAL THREAT INTELLIGENCE</span>
        <h2>Recent Scam Patterns Across World</h2>
        <p>Explore illustrative scam patterns across selected world locations.</p>
      </header>

      <div className="global-map-stage">
        <div className="global-map-glow" />

        <div className="globe-canvas" ref={mountRef} />

        <div className="map-demo-label">
          <span className="demo-dot" />
          DEMO MODE · NOT LIVE INCIDENT DATA
        </div>

        <button
          className="globe-control"
          type="button"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "▶ Resume" : "Ⅱ Pause"}
        </button>

        <div className="recent-pattern-card" aria-live="polite">
          <span className="recent-pattern-label">
            <i />
            SELECTED SAMPLE
          </span>
          <strong>{selected.category}</strong>
          <span>{selected.place}</span>
          <small>Illustrative example · not a verified incident</small>
        </div>

        <div className="global-map-legend">
          <span><i className="legend-medium" /> Sample pattern</span>
          <span><i className="legend-high" /> High sample severity</span>
          <span>Illustrative locations only</span>
        </div>
      </div>

      <div className="global-location-strip">
        <div className="location-strip-heading">
          <div>
            <span className="global-kicker">EXPLORE THE MAP</span>
            <h3>Sample locations</h3>
          </div>
          <span className="location-count">08 LOCATIONS</span>
        </div>

        <div className="global-location-grid">
          {incidents.map((incident) => (
            <button
              type="button"
              key={incident.id}
              className={`global-location-item ${
                selected.id === incident.id ? "active" : ""
              }`}
              onClick={() => setSelected(incident)}
              onMouseEnter={() => setSelected(incident)}
            >
              <span className={`location-severity ${
                incident.severity.toLowerCase()
              }`} />
              <span className="location-item-copy">
                <strong>{incident.place}</strong>
                <small>{incident.category}</small>
              </span>
              <span className="location-arrow">↗</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
