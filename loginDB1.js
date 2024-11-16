<script>
        console.log("Accessing Database...")
        let db;
        let playerPosition = { x: 0, y: 1, z: 0 }; // Player's initial position
        const request = indexedDB.open("GameDatabase", 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            const userStore = db.createObjectStore("users", { keyPath: "username" });
            userStore.createIndex("email", "email", { unique: true });
            userStore.createIndex("characters", "characters", { unique: false });
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            showLoginMenu();
            clearInputFields();
        };

        request.onerror = function() {
            console.error("Error opening IndexedDB");
        };
        request.onload = function() {
            clearInputFields();

        }
        request.reload = function() {
            clearInputFields();

        }
        function clearInputFields() {
            const inputs = document.querySelectorAll("input[type='text'], input[type='password'], input[type='email']");
            inputs.forEach(input => input.value = "");
        }
// <img class="bkgrnd" src="Gods.png">
        function showLoginMenu() {
            clearInputFields();

            document.body.innerHTML = `
            <div class="loginContainer" style="background-image: url('./Gods.png'); height:650px;width:1200px; background-repeat: no-repeat; background-position: center;">
                <div style="border: 2px solid gold; position: relative;top: 50%;left:25%;width:600px;background: rgba(.1,.1,.1,.7);">
                    <h2 stsyle="top: 50%;">Login</h2>
                    <input type="text" id="loginUsername" placeholder="Username" required>
                    <input type="password" id="loginPassword" placeholder="Password" required>
                    <br>
                    <label><input type="checkbox" id="saveUsername"> Save my username</label>
                    <br>
                    <button onclick="login()">Login</button>
                    <button onclick="showRegisterMenu()">Register User</button>
                    <button onclick="printDatabase()">Print Database</button>
                    <button onclick="clearInputFields()">Clear Input Fields</button>
                </div>
            </div>
            `;
            clearInputFields();
        }

        function showRegisterMenu() {
            clearInputFields();
            document.body.innerHTML = `
            <div style="background-image: url('./Gods.png'); height:650px;width:1200px; background-repeat: no-repeat; background-position: center;">
                <h2>Register</h2>
                <input type="text" id="regUsername" placeholder="Username" required>
                <input type="password" id="regPassword" placeholder="Password" required>
                <input type="email" id="regEmail" placeholder="Email" required>
                <button onclick="registerUser()">Register</button>
                <button onclick="showLoginMenu()">Back to Login</button>
            </div>
            `;
            clearInputFields();
        }

        function showWelcomeMenu(user) {
            clearInputFields();

            document.body.innerHTML = `
                        <div style="background-image: url('./Gods.png'); height:650px;width:1200px; background-repeat: no-repeat; background-position: center;">

                <h2>Welcome, ${user.username}!</h2>
                <button onclick="switchUser()">Switch User</button>
                <button onclick="printDatabase()">Print Database</button>
                <div id="characterSelection">
                    <h3>Character Selection</h3>
                    <button onclick="createCharacter('${user.username}')">Create Character</button>
                    <ul id="characterList"></ul>
                </div>
                </div>
            `;
            loadUserCharacters(user.username);
            clearInputFields();
        }

        function registerUser() {
            clearInputFields();

            const username = document.getElementById("regUsername").value;
            const password = document.getElementById("regPassword").value;
            const email = document.getElementById("regEmail").value;
            const user = { username, password, email, characters: [] };

            const transaction = db.transaction(["users"], "readwrite");
            const userStore = transaction.objectStore("users");

            const addRequest = userStore.add(user);
            addRequest.onsuccess = function() {
                alert("User registered successfully");
                showLoginMenu();
            };

            addRequest.onerror = function() {
                alert("Error: Username or email already exists");
            };
            clearInputFields();
        }

        function login() {
            // clearInputFields();

            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            const transaction = db.transaction(["users"], "readonly");
            const userStore = transaction.objectStore("users");

            const getRequest = userStore.get(username);
            getRequest.onsuccess = function() {
                const user = getRequest.result;
                if (user && user.password === password) {
                    showWelcomeMenu(user);
                } else {
                    alert("Invalid username or password");
                }
                //clearInputFields();
            };

            getRequest.onerror = function() {
                alert("Error logging in");
            };
            //clearInputFields();
        }

        function switchUser() {
            showLoginMenu();
        }

        function createCharacter(username) {
            const characterName = prompt("Enter character name:");
            if (!characterName) return;

            const character = {
                name: characterName,
                level: 1,
                position: { x: 0, y: 0, z: 0 },
            };

            const transaction = db.transaction(["users"], "readwrite");
            const userStore = transaction.objectStore("users");

            const getRequest = userStore.get(username);
            getRequest.onsuccess = function() {
                const user = getRequest.result;
                user.characters.push(character);

                const updateRequest = userStore.put(user);
                updateRequest.onsuccess = function() {
                    loadUserCharacters(username);
                };
            };
        }

        function loadUserCharacters(username) {
            const transaction = db.transaction(["users"], "readonly");
            const userStore = transaction.objectStore("users");

            const getRequest = userStore.get(username);
            getRequest.onsuccess = function() {
                const user = getRequest.result;
                const characterList = document.getElementById("characterList");
                characterList.innerHTML = "";

                user.characters.forEach((character, index) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${character.name}`;

                    const enterWorldButton = document.createElement("button");
                    enterWorldButton.textContent = "Enter World";
                    enterWorldButton.onclick = () => enterWorld(character, username);

                    const showInfoButton = document.createElement("button");
                    showInfoButton.textContent = "Show Info";
                    showInfoButton.onclick = () => console.log(character);

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.onclick = () => deleteCharacter(username, index);

                    listItem.appendChild(enterWorldButton);
                    listItem.appendChild(showInfoButton);
                    listItem.appendChild(deleteButton);
                    characterList.appendChild(listItem);
                });
            };
        }

        function deleteCharacter(username, characterIndex) {
            const transaction = db.transaction(["users"], "readwrite");
            const userStore = transaction.objectStore("users");

            const getRequest = userStore.get(username);
            getRequest.onsuccess = function() {
                const user = getRequest.result;
                user.characters.splice(characterIndex, 1);

                const updateRequest = userStore.put(user);
                updateRequest.onsuccess = function() {
                    loadUserCharacters(username);
                };
            };
        }

        function enterWorld(character, username) {
            playerPosition = { ...character.position }; // Load the saved position
            initThreeJS(character, username);
        }

        function initThreeJS(character, username) {

            document.body.innerHTML = ``; // Clear existing HTML
            document.body.innerHTML = `<button id="menuButton" onclick="showWelcomeMenuAgain('${username}')">Show Menu</button>`;

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(playerPosition.x, playerPosition.y + 5, playerPosition.z + 10);
            camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);

            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
            const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
            playerMesh.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
            scene.add(playerMesh);

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            const keyState = {};

            function handleKeyDown(event) {
                keyState[event.code] = true;
            }

            function handleKeyUp(event) {
                keyState[event.code] = false;
            }

            function updatePlayerPosition() {
                const speed = 0.1;
                if (keyState['KeyW']) playerMesh.position.z -= speed;
                if (keyState['KeyS']) playerMesh.position.z += speed;
                if (keyState['KeyA']) playerMesh.position.x -= speed;
                if (keyState['KeyD']) playerMesh.position.x += speed;
                camera.position.set(playerMesh.position.x, playerMesh.position.y + 5, playerMesh.position.z + 10);
                camera.lookAt(playerMesh.position.x, playerMesh.position.y, playerMesh.position.z);
                // Save position to IndexedDB
                saveCharacterPosition(username, playerMesh.position);

                requestAnimationFrame(updatePlayerPosition);
            }

            updatePlayerPosition();

            function saveCharacterPosition(username, position) {
                const transaction = db.transaction(["users"], "readwrite");
                const userStore = transaction.objectStore("users");

                const getRequest = userStore.get(username);
                getRequest.onsuccess = function() {
                    const user = getRequest.result;
                    user.characters.forEach((char) => {
                        if (char.name === character.name) {
                            char.position = { x: position.x, y: position.y, z: position.z };
                        }
                    });

                    userStore.put(user);
                };
            }

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();
        }

        function printDatabase() {
            const transaction = db.transaction(["users"], "readonly");
            const userStore = transaction.objectStore("users");

            const getAllRequest = userStore.getAll();
            getAllRequest.onsuccess = function(event) {
                console.log("All Users:", event.target.result);
            };
        }

        function showWelcomeMenuAgain(username) {
            // Restore the welcome menu and hide the Three.js scene
            const transaction = db.transaction(["users"], "readonly");
            const userStore = transaction.objectStore("users");

            const getRequest = userStore.get(username);
            getRequest.onsuccess = function() {
                const user = getRequest.result;
                showWelcomeMenu(user);
            };
        }
