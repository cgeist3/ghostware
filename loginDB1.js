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

    function clearInputFields() {
      const inputs = document.querySelectorAll("input[type='text'], input[type='password'], input[type='email']");
      inputs.forEach(input => input.value = "");
    }

    function showLoginMenu() {
      document.body.innerHTML = `
        <h2>Login</h2>
        <input type="text" id="loginUsername" placeholder="Username" required>
        <input type="password" id="loginPassword" placeholder="Password" required>
        <br>
        <label><input type="checkbox" id="saveUsername"> Save my username</label>
        <br>
        <button onclick="login()">Login</button>
        <button onclick="showRegisterMenu()">Register User</button>
        <button onclick="printDatabase()">Print Database</button>
        <button onclick="clearInputFields()">Clear Input Fields</button>
      `;
      clearInputFields();
    }

    function showRegisterMenu() {
      document.body.innerHTML = `
        <h2>Register</h2>
        <input type="text" id="regUsername" placeholder="Username" required>
        <input type="password" id="regPassword" placeholder="Password" required>
        <input type="email" id="regEmail" placeholder="Email" required>
        <button onclick="registerUser()">Register</button>
        <button onclick="showLoginMenu()">Back to Login</button>
      `;
      clearInputFields();
    }

    function showWelcomeMenu(user) {
      document.body.innerHTML = `
        <h2>Welcome, ${user.username}!</h2>
        <button onclick="switchUser()">Switch User</button>
        <button onclick="printDatabase()">Print Database</button>
        <div id="characterSelection">
          <h3>Character Selection</h3>
          <button onclick="createCharacter('${user.username}')">Create Character</button>
          <ul id="characterList"></ul>
        </div>
      `;
      loadUserCharacters(user.username);
      clearInputFields();
    }

    function registerUser() {
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
        clearInputFields();
      };

      getRequest.onerror = function() {
        alert("Error logging in");
      };
      clearInputFields();
    }

    function switchUser() {
      showLoginMenu();
    }

    function createCharacter(username) {
      const characterName = prompt("Enter character name:");
      if (!characterName) return;
    // Cube (Player) creation
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const characterMesh = new THREE.Mesh(geometry, material);
      const character = {
        name: characterName,
        level: 1,
        position: { x: 0, y: 0, z: 0 },
        // mesh: characterMesh,
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
          enterWorldButton.onclick = () => enterWorld(character);

          const showInfoButton = document.createElement("button");
          showInfoButton.textContent = "Show Info";
          showInfoButton.onclick = () => {
            console.log(character);
          }
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

    function enterWorld(character) {
    //   playerPosition = { ...character.position };
      initThreeJS(character);
    }

    function initThreeJS(character) {
        document.body.innerHTML = ``;
      let lastKnownPosition = { x: character.position.x, y: character.position.y, z: character.position.z };
      let lastUpdateTime = Date.now(); // Optional: to throttle updates further

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(character.position.x, character.position.y + 5, character.position.z + 10);
      camera.lookAt(character.position.x, character.position.y, character.position.z);

      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
      const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
      playerMesh.position.set(character.position.x, character.position.y, character.position.z);
      scene.add(playerMesh);
       
      
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  // Handle Key Events for Movement
  const keyState = {};
  function handleKeyDown(event) {
    keyState[event.code] = true;
  }

  function handleKeyUp(event) {
    keyState[event.code] = false;
  }
  // Update Player Position
  function updatePlayerPosition() {
    const speed = 0.1;
    if (keyState['KeyW']) playerMesh.position.z -= speed;
    if (keyState['KeyS']) playerMesh.position.z += speed;
    if (keyState['KeyA']) playerMesh.position.x -= speed;
    if (keyState['KeyD']) playerMesh.position.x += speed;

    // Update player's position in the world
    character.position.x = playerMesh.position.x;
    character.position.z = playerMesh.position.z;
    
  }

      function animate() {
        requestAnimationFrame(animate);
        updatePlayerPosition();

        renderer.render(scene, camera);
      }
      animate();
    }

    // Save the current player position automatically
function autoSave() {
    if (character) {
        const playerData = { 
            name: character.name, 
            position: {x: character.position.x,
            y: character.position.y,
            z: character.position.z,
            }
            // userData: player.userData,
        };
        savePlayerPosition(character, playerData);
    }
}
// Save player position
function savePlayerPosition(saveName, playerData) {
    if (!db) {
        console.error('Database not ready yet. Try again.');
        return;
    }
    
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    playerData.id = saveName;

    const request = objectStore.put(playerData);
    request.onsuccess = () => {
        // console.log('Player position saved:', playerData);
    };
    request.onerror = (event) => {
        console.error('Error saving player position:', event.target.errorCode);
    };
}


    function printDatabase() {
      const transaction = db.transaction(["users"], "readonly");
      const userStore = transaction.objectStore("users");

      userStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          console.log(cursor.value);
          cursor.continue();
        }
      };
    }

    window.onload = showLoginMenu;
