// === Updated script.js === 
const socket = io("https://wonderful-destiny-open.glitch.me/");

const video = document.getElementById("video"); const chat = document.getElementById("chat"); const msgInput = document.getElementById("msg"); const replyBox = document.getElementById("replyBox");

let username = ""; let isHost = false; let currentHost = "Rovan"; let replyTo = null; let ignoreNextEvent = false;

function emitSync(type) { if (!isHost) return; socket.emit("sync", { type, time: video.currentTime, from: username }); }

video.addEventListener("play", () => { if (!ignoreNextEvent) emitSync("play"); });

video.addEventListener("pause", () => { if (!ignoreNextEvent) emitSync("pause"); });

video.addEventListener("seeked", () => { if (isHost) emitSync("seek"); });

socket.on("sync", (data) => { if (data.from === username) return;

ignoreNextEvent = true; const shouldUpdateTime = Math.abs(video.currentTime - data.time) > 0.3; if (shouldUpdateTime) video.currentTime = data.time;

if (data.type === "play") { video.play().catch(() => {}); } else if (data.type === "pause") { video.pause(); }

setTimeout(() => (ignoreNextEvent = false), 500); });

function askUsername() { username = localStorage.getItem("username") || prompt("Enter your username:"); socket.emit("register", username, (res) => { if (!res.success) { alert(res.message); askUsername(); } else { isHost = username === res.currentHost; currentHost = res.currentHost; localStorage.setItem("username", username);

if (res.videoStatus) {
    video.currentTime = res.videoStatus.time;
    setTimeout(() => {
      if (res.videoStatus.isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, 300);
  }

  loadChatHistory(res.chatMessages);
  showHostStatus();
}

}); } askUsername();

function changeUsername() { localStorage.removeItem("username"); location.reload(); }

function showHostStatus() { document.querySelector(".header span").textContent = 869tv Chat — Host: ${currentHost}; }

socket.on("hostChanged", (newHost) => { currentHost = newHost; isHost = (username === newHost); showHostStatus(); alert(Host changed to ${newHost}); });

function sendMessage() { const text = msgInput.value.trim(); if (!text) return;

if (text.startsWith("@host ")) { const newHost = text.split(" ")[1]; if (newHost) { socket.emit("changeHost", newHost); } } else { socket.emit("chat", { text, username, replyTo }); }

msgInput.value = ""; replyTo = null; replyBox.classList.add("hidden"); }

function loadChatHistory(messages) { messages.forEach(renderMessage); }

socket.on("chat", renderMessage);

function renderMessage({ text, username: from, replyTo }) { const div = document.createElement("div"); div.className = "msg " + (from === username ? "right" : "left");

if (replyTo) { const reply = document.createElement("div"); reply.className = "reply-box"; reply.innerText = ${replyTo.username}: ${replyTo.text}; div.appendChild(reply); }

const msg = document.createElement("div"); msg.innerHTML = <b>${from}</b>: ${text}; div.appendChild(msg);

div.onclick = () => { replyTo = { username: from, text }; replyBox.innerText = Replying to ${from}: ${text}; replyBox.classList.remove("hidden"); };

chat.appendChild(div); chat.scrollTop = chat.scrollHeight; }

