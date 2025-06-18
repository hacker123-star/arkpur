const socket = io("https://wonderful-destiny-open.glitch.me/"); // Replace with your actual Glitch backend URL

const video = document.getElementById("video");
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const replyBox = document.getElementById("replyBox");

let username = "";
let isHost = false;
let currentHost = "Rovan";
let replyTo = null;
let isSyncing = false;
let syncTimeout = null;

// Emit sync only if host and not already syncing
function emitSync(type) {
  if (!isHost || isSyncing) return;
  socket.emit("sync", { type, time: video.currentTime, from: username });
}

// Listen for video sync updates
socket.on("sync", (data) => {
  if (data.from === username) return; // Ignore own sync events

  isSyncing = true;
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => isSyncing = false, 1000);

  video.currentTime = data.time;

  if (data.type === "play") {
    video.play().catch(() => {});
  } else if (data.type === "pause") {
    video.pause();
  }
});

// Handle video events
video.addEventListener("play", () => emitSync("play"));
video.addEventListener("pause", () => emitSync("pause"));
video.addEventListener("seeked", () => emitSync("seek"));

// Register username
function askUsername() {
  username = localStorage.getItem("username") || prompt("Enter your username:");
  socket.emit("register", username, (res) => {
    if (!res.success) {
      alert(res.message);
      askUsername(); // Ask again
    } else {
      isHost = username === res.currentHost;
      currentHost = res.currentHost;
      localStorage.setItem("username", username);

      if (res.videoStatus) {
        video.currentTime = res.videoStatus.time;
        res.videoStatus.isPlaying ? video.play() : video.pause();
      }

      loadChatHistory(res.chatMessages);
      showHostStatus();
    }
  });
}
askUsername();

function changeUsername() {
  localStorage.removeItem("username");
  location.reload();
}

function showHostStatus() {
  document.querySelector(".header span").textContent =
    `869tv Chat — Host: ${currentHost}`;
}

// Host update
socket.on("hostChanged", (newHost) => {
  currentHost = newHost;
  isHost = username === newHost;
  showHostStatus();
  alert(`Host changed to ${newHost}`);
});

// Chat send
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  socket.emit("chat", { text, username, replyTo });
  msgInput.value = "";
  replyTo = null;
  replyBox.classList.add("hidden");
}

// Load full chat history
function loadChatHistory(messages) {
  messages.forEach((msg) => renderMessage(msg));
}

// Handle new message
socket.on("chat", renderMessage);

// Render message with reply support
function renderMessage({ text, username: from, replyTo }) {
  const div = document.createElement("div");
  div.className = "msg " + (from === username ? "right" : "left");

  if (replyTo) {
    const reply = document.createElement("div");
    reply.className = "reply-box";
    reply.innerText = `${replyTo.username}: ${replyTo.text}`;
    div.appendChild(reply);
  }

  const msg = document.createElement("div");
  msg.innerHTML = `<b>${from}</b>: ${text}`;
  div.appendChild(msg);

  div.onclick = () => {
    replyTo = { username: from, text };
    replyBox.innerText = `Replying to ${from}: ${text}`;
    replyBox.classList.remove("hidden");
  };

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
