const socket = io("https://wonderful-destiny-open.glitch.me/");
const video = document.getElementById("video");
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const replyBox = document.getElementById("replyBox");

let username = "";
let replyTo = null;
let isSyncing = false;

// Ask username once
function askUsername() {
  username = localStorage.getItem("username") || prompt("Enter username:");
  socket.emit("register", username, (response) => {
    if (!response.success) {
      alert(response.message);
      askUsername(); // Retry
    } else {
      localStorage.setItem("username", username);
      loadChatHistory(response.chatMessages);
      if (response.videoStatus) {
        video.currentTime = response.videoStatus.time;
        if (response.videoStatus.isPlaying) video.play();
        else video.pause();
      }
    }
  });
}

askUsername();

// Chat system
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

// Video sync logic with loop prevention
video.addEventListener("play", () => {
  if (isSyncing) return;
  socket.emit("sync", { type: "play", time: video.currentTime });
});

video.addEventListener("pause", () => {
  if (isSyncing) return;
  socket.emit("sync", { type: "pause", time: video.currentTime });
});

video.addEventListener("seeked", () => {
  if (isSyncing) return;
  socket.emit("sync", { type: "seek", time: video.currentTime });
});

socket.on("sync", (data) => {
  isSyncing = true;
  video.currentTime = data.time;
  if (data.type === "play") video.play();
  if (data.type === "pause") video.pause();
  isSyncing = false;
});

function changeUsername() {
  localStorage.removeItem("username");
  location.reload();
                      }
