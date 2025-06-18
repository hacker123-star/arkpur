const socket = io("https://wonderful-destiny-open.glitch.me/");

const video = document.getElementById("video");
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const replyBox = document.getElementById("replyBox");

let username = "";
let isHost = false;
let currentHost = "Rovan";
let replyTo = null;
let isSyncing = false;

function emitSync(type) {
  if (!isHost || isSyncing) return;
  isSyncing = true;

  socket.emit("sync", { type, time: video.currentTime, from: username });

  setTimeout(() => {
    isSyncing = false;
  }, 1000);
}

socket.on("sync", (data) => {
  if (data.from === username) return;

  const near = Math.abs(video.currentTime - data.time) < 0.3;
  if (!near) video.currentTime = data.time;

  if (data.type === "play" && video.paused) {
    video.play().catch(() => {});
  } else if (data.type === "pause" && !video.paused) {
    video.pause();
  }
});

video.addEventListener("play", () => {
  if (!isSyncing && isHost && !video.paused) emitSync("play");
});

video.addEventListener("pause", () => {
  if (!isSyncing && isHost && video.paused) emitSync("pause");
});

video.addEventListener("seeked", () => {
  if (!isSyncing && isHost) emitSync("seek");
});

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
        res.videoStatus.isPlaying ? video.play().catch(() => {}) : video.pause();
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
  document.querySelector(".header span").textContent = `869tv Chat — Host: ${currentHost}`;
}

socket.on("hostChanged", (newHost) => {
  currentHost = newHost;
  isHost = (username === newHost);
  showHostStatus();
  alert(`Host changed to ${newHost}`);
});

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

function loadChatHistory(messages) {
  messages.forEach(renderMessage);
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
