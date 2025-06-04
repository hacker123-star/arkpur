const socket = io("https://wonderful-destiny-open.glitch.me"); // Change to your Glitch URL

const video = document.getElementById("video");
const chatBox = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const replyPreview = document.getElementById("reply-preview");
const replyToText = document.getElementById("reply-to-text");

let replyTo = null;
let isSeeking = false;

let username = prompt("Enter your name:") || "Guest";
socket.emit("join", username);

// Video event listeners to emit play/pause/seek
video.addEventListener("play", () => {
  if (!isSeeking) socket.emit("play", video.currentTime);
});

video.addEventListener("pause", () => {
  if (!isSeeking) socket.emit("pause", video.currentTime);
});

video.addEventListener("seeking", () => {
  isSeeking = true;
});

video.addEventListener("seeked", () => {
  socket.emit("seek", video.currentTime);
  isSeeking = false;
});

// Listen to video state updates from backend
socket.on("video state", (state) => {
  video.currentTime = state.time;
  if (state.playing) {
    video.play();
  } else {
    video.pause();
  }
});

socket.on("play", (time) => {
  video.currentTime = time;
  video.play();
});

socket.on("pause", (time) => {
  video.currentTime = time;
  video.pause();
});

socket.on("seek", (time) => {
  video.currentTime = time;
});

// Chat message send button click
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text !== "") {
    socket.emit("chat message", { message: text, replyTo });
    messageInput.value = "";
    cancelReply();
  }
};

// Receive chat messages
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
  
  // Clicking on message sets reply
  msgDiv.onclick = () => {
    replyTo = `${username}: ${message}`;
    replyToText.textContent = replyTo;
    replyPreview.style.display = "block";
  };
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Cancel reply
function cancelReply() {
  replyTo = null;
  replyPreview.style.display = "none";
}