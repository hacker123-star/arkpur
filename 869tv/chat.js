const socket = io("https://wonderful-destiny-open.glitch.me");

const video = document.getElementById("video");
let seeking = false;
let isRemote = false;
let username = prompt("Enter your name:") || "Guest";

// === JOIN ===
socket.emit("join", username);

// === Sync on Join ===
socket.on("video state", ({ time, playing }) => {
  isRemote = true;
  video.currentTime = time;
  playing ? video.play() : video.pause();
});

// === Video Controls ===
video.addEventListener("play", () => {
  if (!isRemote) socket.emit("play", video.currentTime);
  isRemote = false;
});

video.addEventListener("pause", () => {
  if (!isRemote) socket.emit("pause", video.currentTime);
  isRemote = false;
});

video.addEventListener("seeking", () => {
  seeking = true;
});
video.addEventListener("seeked", () => {
  if (!isRemote) socket.emit("seek", video.currentTime);
  isRemote = false;
  seeking = false;
});

// === Server Updates ===
socket.on("play", (time) => {
  isRemote = true;
  video.currentTime = time;
  video.play();
});

socket.on("pause", (time) => {
  isRemote = true;
  video.currentTime = time;
  video.pause();
});

socket.on("seek", (time) => {
  isRemote = true;
  video.currentTime = time;
});

// === CHAT CODE stays same ===
// (chat.js continues with message sending & reply features...)

// === CHAT EVENTS ===
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text !== "") {
    socket.emit("chat message", {
      message: text,
      replyTo
    });
    messageInput.value = "";
    cancelReply();
  }
};

socket.on("chat message", ({ username, message, replyTo }) => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  
  if (replyTo) {
    const replyDiv = document.createElement("div");
    replyDiv.classList.add("reply");
    replyDiv.textContent = `↪ ${replyTo}`;
    msgDiv.appendChild(replyDiv);
  }
  
  const content = document.createElement("div");
  content.innerHTML = `<strong>${username}:</strong> ${message}`;
  msgDiv.appendChild(content);
  
  msgDiv.onclick = () => {
    replyTo = `${username}: ${message}`;
    replyToText.textContent = replyTo;
    replyPreview.style.display = "flex";
  };
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

function cancelReply() {
  replyTo = null;
  replyPreview.style.display = "none";
}