const socket = io("https://wonderful-destiny-open.glitch.me"); // Replace with your Glitch project

const video = document.getElementById("video");
const chatBox = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const replyPreview = document.getElementById("reply-preview");
const replyToText = document.getElementById("reply-to-text");

let replyTo = null;

let username = prompt("Enter your name:") || "Guest";
socket.emit("join", username);

video.addEventListener("play", () => socket.emit("play", video.currentTime));
video.addEventListener("pause", () => socket.emit("pause", video.currentTime));
video.addEventListener("seeked", () => socket.emit("seek", video.currentTime));

socket.on("play", (time) => { video.currentTime = time; video.play(); });
socket.on("pause", (time) => { video.currentTime = time; video.pause(); });
socket.on("seek", (time) => { video.currentTime = time; });

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text !== "") {
    socket.emit("chat message", { message: text, replyTo });
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
    replyPreview.style.display = "block";
  };

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

function cancelReply() {
  replyTo = null;
  replyPreview.style.display = "none";
}