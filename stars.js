// Starry background using Three.js
let scene, camera, renderer, stars;

function initStarryBackground() {
    const canvas = document.getElementById('starry-background');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, document.documentElement.scrollHeight); // Set canvas to cover the entire page height
    renderer.setPixelRatio(window.devicePixelRatio);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    let starGeometry = new THREE.BufferGeometry();
    let starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        let x = (Math.random() - 0.5) * 2000;
        let y = (Math.random() - 0.5) * 2000;
        let z = -Math.random() * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    stars.rotation.x += 0.0002;
    stars.rotation.y += 0.0002;
    renderer.render(scene, camera);
}

// Resize canvas with window and document height
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, document.documentElement.scrollHeight); // Adjust to total page height on resize
});

// Initialize the starry background
initStarryBackground();
