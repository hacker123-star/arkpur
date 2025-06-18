const socket = io("https://wonderful-destiny-open.glitch.me/"); // Replace with your Glitch URL
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

// Sync Events
function emitSync(type) {
  if (isSyncing) return;
  socket.emit("sync", { type, time: video.currentTime });
}

video.addEventListener("play", () => {
  if (isHost) emitSync("play");
  else video.pause();
});

video.addEventListener("pause", () => {
  if (isHost) emitSync("pause");
});

video.addEventListener("seeked", () => emitSync("seek"));

socket.on("sync", (data) => {
  isSyncing = true;
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => isSyncing = false, 1000);

  video.currentTime = data.time;
  if (data.type === "play" && video.paused) video.play();
  else if (data.type === "pause" && !video.paused) video.pause();
});

// Register Username
function askUsername() {
  username = localStorage.getItem("username") || prompt("Enter your username:");
  socket.emit("register", username, (res) => {
    if (!res.success) {
      alert(res.message);
      askUsername();
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

// Listen for host updates
socket.on("hostChanged", (newHost) => {
  currentHost = newHost;
  isHost = username === newHost;
  showHostStatus();
  alert(`Host changed to ${newHost}`);
});

// Chat Logic
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  socket.emit("chat", { text, username, replyTo });
  msgInput.value = "";
  replyTo = null;
  replyBox.classList.add("hidden");
}

function loadChatHistory(messages) {
  messages.forEach((msg) => renderMessage(msg));
}

socket.on("chat", renderMessage);

function renderMessage({ text, username: from, replyTo }) {
  const div = document.createElement("div");
  div.className = "msg " + (from === username ? "right" : "left");

  if (replyTo) {
    const reply = document.createElement("div");
    reply.className = "reply-box";
    reply.innerText = `${replyTo.username}: ${replyTo.text}`;
    div.appendChild(reply);
  }

  div.innerHTML += `<b>${from}</b>: ${text}`;
  div.onclick = () => {
    replyTo = { username: from, text };
    replyBox.innerText = `Replying to ${from}: ${text}`;
    replyBox.classList.remove("hidden");
  };

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
