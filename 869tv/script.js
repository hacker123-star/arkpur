
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

// Handle incoming sync events
socket.on("sync", (data) => {
  if (data.from === username) return; // Ignore self-sync

  isSyncing = true;
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => isSyncing = false, 1000);

  if (Math.abs(video.currentTime - data.time) > 0.3) {
    video.currentTime = data.time;
  }

  if (data.type === "play" && video.paused) {
    video.play().catch(() => {});
  } else if (data.type === "pause" && !video.paused) {
    video.pause();
  }
});

// Register video events
video.addEventListener("play", () => {
  if (!isSyncing && isHost) emitSync("play");
});
video.addEventListener("pause", () => {
  if (!isSyncing && isHost) emitSync("pause");
});
video.addEventListener("seeked", () => {
  if (!isSyncing && isHost) emitSync("seek");
});

// Register username
function askUsername() {
  username = localStorage.getItem("username") || prompt("Enter your username:");
  socket.emit("register", username, (res) => {
    if (!res.success) {
      alert(res.message);
      askUsername(); // Ask again if name taken
    } else {
      isHost = username === res.currentHost;
      currentHost = res.currentHost;
      localStorage.setItem("username", username);

      if (res.videoStatus) {
        video.currentTime = res.videoStatus.time;
        res.videoStatus.isPlaying ? video.play().catch(() => {}) : video.pause();
      }

      loadChatHistory(res.chatMessages);
      showHostStatus();
    }
  });
}
askUsername();

// Optional: to let user change name later
function changeUsername() {
  localStorage.removeItem("username");
  location.reload();
}

// Show host status
function showHostStatus() {
  document.querySelector(".header span").textContent =
    `869tv Chat — Host: ${currentHost}`;
}

// Host changed
socket.on("hostChanged", (newHost) => {
  currentHost = newHost;
  isHost = (username === newHost);
  showHostStatus();
  alert(`Host changed to ${newHost}`);
});

// Send message
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  if (text.startsWith("@host ")) {
    const newHost = text.split(" ")[1];
    if (newHost) {
      socket.emit("changeHost", newHost);
    }
  } else {
    socket.emit("chat", { text, username, replyTo });
  }

  msgInput.value = "";
  replyTo = null;
  replyBox.classList.add("hidden");
}

// Load existing chat messages
function loadChatHistory(messages) {
  messages.forEach(renderMessage);
}

// Render incoming chat message
socket.on("chat", renderMessage);

// Render chat bubble with reply support
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
