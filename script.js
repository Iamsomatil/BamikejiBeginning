// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOEXWrNkHwo0faWrhEGsbHJqUsGe9p2rM",
  authDomain: "thebamikejibeginings.firebaseapp.com",
  projectId: "thebamikejibeginings",
  storageBucket: "thebamikejibeginings.appspot.com",
  messagingSenderId: "448487183819",
  appId: "1:448487183819:web:49fed24884891ca9e0d24e",
  measurementId: "G-1VCQC4N6D0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Import getStorage from Firebase
const analytics = getAnalytics(app);

document.getElementById("fileInput").addEventListener("change", uploadImages);

// Function to upload images
function uploadImages() {
  const input = document.getElementById("fileInput");
  const gallery = document.getElementById("gallery");

  for (let file of input.files) {
    const storageRef = ref(storage, "images/" + file.name); // Create a reference to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, file); // Start the file upload

    uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Track upload progress
        console.log(
          "Upload is " +
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100 +
            "% done"
        );
      },
      function (error) {
        console.error("Upload failed:", error);
      },
      function () {
        // Upload completed successfully, get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);

          // Save image URL to IndexedDB
          saveImageUrl(downloadURL);

          // Display the image
          displayImage(downloadURL);
        });
      }
    );
  }
}

// Save image URL to IndexedDB
function saveImageUrl(url) {
  const request = indexedDB.open("MemoryDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("memories", { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("memories", "readwrite");
    const store = transaction.objectStore("memories");
    store.add({ url: url });
  };
}

// Display images from IndexedDB after reload
function loadImages() {
  const request = indexedDB.open("MemoryDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("memories", "readonly");
    const store = transaction.objectStore("memories");
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        displayImage(cursor.value.url);
        cursor.continue();
      }
    };
  };
}

// Function to display the image
function displayImage(url) {
  const gallery = document.getElementById("gallery");
  const img = document.createElement("img");
  img.src = url;
  img.style.maxWidth = "100%";
  img.style.height = "auto";
  gallery.appendChild(img);
}

// Load images when the page is loaded
window.onload = loadImages;
