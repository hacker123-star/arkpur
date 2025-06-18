// script.js
const video = document.getElementById('videoPlayer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const usernameInput = document.getElementById('username');
const replyPreview = document.getElementById('replyPreview');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
let currentReply = null;
let username = localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`;
usernameInput.value = username;
let lastSyncTime = 0;
const syncInterval = 1000;

const ws = new WebSocket('wss://wonderful-destiny-open.glitch.me');

function updateUsername() {
  const newUsername = usernameInput.value.trim();
  if (newUsername) {
    ws.send(JSON.stringify({ type: 'username', username: newUsername }));
  }
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (text) {
    const message = {
      username,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reply: currentReply
    };
    ws.send(JSON.stringify({ type: 'chat', message }));
    chatInput.value = '';
    cancelReply();
  }
}

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function cancelReply() {
  currentReply = null;
  replyPreview.style.display = 'none';
}

function replyToMessage(message) {
  currentReply = message;
  replyUsername.textContent = message.username;
  replyText.textContent = message.text;
  replyPreview.style.display = 'flex';
  chatInput.focus();
}

function displayMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  if (message.reply) {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'reply';
    replyDiv.innerHTML = `<span>${message.reply.username}:</span> ${message.reply.text}`;
    messageDiv.appendChild(replyDiv);
  }
  
  messageDiv.innerHTML += `
    <div class="username">${message.username}</div>
    <div class="text">${message.text}</div>
    <div class="time">${message.time}</div>
    <button class="reply-btn" onclick='replyToMessage(${JSON.stringify(message)})'>Reply</button>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function syncVideoState() {
  const currentTime = video.currentTime;
  const isPlaying = !video.paused;
  if (Math.abs(currentTime - videoState.time) > 0.5 || isPlaying !== videoState.isPlaying) {
    ws.send(JSON.stringify({ type: 'video', time: currentTime, isPlaying }));
  }
}

ws.onmessage = function(event) {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'videoState' || data.type === 'video') {
      const serverTime = parseFloat(data.type === 'videoState' ? data.data.time : data.time);
      const isPlaying = data.type === 'videoState' ? data.data.isPlaying : data.isPlaying;
      const timeDiff = Math.abs(video.currentTime - serverTime);
      if (timeDiff > 0.5 && Date.now() - lastSyncTime > syncInterval) {
        video.currentTime = serverTime;
        lastSyncTime = Date.now();
      }
      if (isPlaying && video.paused) {
        video.play().catch((e) => console.error('Play error:', e));
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
      videoState = { time: serverTime, isPlaying };
    } else if (data.type === 'chat') {
      displayMessage(data.message);
    } else if (data.type === 'usernameSuccess') {
      username = data.username;
      localStorage.setItem('username', username);
      usernameInput.value = username;
      alert('Username updated!');
    } else if (data.type === 'usernameError') {
      alert(data.message);
      usernameInput.value = username;
    } else if (data.type === 'usedUsernames') {
      usedUsernames = new Set(data.data);
    }
  } catch (e) {
    console.error('WebSocket message error:', e);
  }
};

video.addEventListener('play', () => {
  syncVideoState();
});

video.addEventListener('pause', () => {
  syncVideoState();
});

video.addEventListener('seeked', () => {
  syncVideoState();
});

video.addEventListener('timeupdate', () => {
  if (Date.now() - lastSyncTime > syncInterval) {
    syncVideoState();
  }
});

video.addEventListener('click', (e) => {
  if (e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});

chatMessages.addEventListener('DOMNodeInserted', () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

ws.onopen = function() {
  ws.send(JSON.stringify({ type: 'username', username }));
};
