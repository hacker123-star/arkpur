const socket = io("https://wonderful-destiny-open.glitch.me/");
const video = document.getElementById("video");
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const replyBox = document.getElementById("replyBox");

let username = prompt("Enter your username:") || "Guest";
let replyTo = null;

// Video sync logic
video.addEventListener("play", () => {
  socket.emit("sync", { type: "play", time: video.currentTime });
});
video.addEventListener("pause", () => {
  socket.emit("sync", { type: "pause", time: video.currentTime });
});
video.addEventListener("seeked", () => {
  socket.emit("sync", { type: "seek", time: video.currentTime });
});

socket.on("sync", (data) => {
  if (data.type === "play") {
    video.currentTime = data.time;
    video.play();
  } else if (data.type === "pause") {
    video.currentTime = data.time;
    video.pause();
  } else if (data.type === "seek") {
    video.currentTime = data.time;
  }
});

// Chat logic
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit("chat", { text, username, replyTo });
  msgInput.value = "";
  replyTo = null;
  replyBox.classList.add("hidden");
}

socket.on("chat", ({ text, username: from, replyTo }) => {
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
});

function changeUsername() {
  const newName = prompt("Enter new username:");
  if (newName) username = newName;
}
