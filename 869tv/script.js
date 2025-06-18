// script.js
const video = document.getElementById('videoPlayer');
const videoContainer = document.getElementById('videoContainer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const usernameInput = document.getElementById('username');
const replyPreview = document.getElementById('replyPreview');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
let currentReply = null;
let username = localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`;
usernameInput.value = username;
let isHost = false;
let lastSyncTime = 0;
const syncInterval = 1000;
let videoState = { time: 0, isPlaying: false };
let videoReady = false;

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
  messageDiv.className = `message ${message.username === username ? 'own' : 'other'}`;
  
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
  if (!isHost) return;
  const currentTime = video.currentTime;
  const isPlaying = !video.paused;
  if (Math.abs(currentTime - videoState.time) > 0.5 || isPlaying !== videoState.isPlaying) {
    ws.send(JSON.stringify({ type: 'video', time: currentTime, isPlaying }));
  }
}

function applyVideoState() {
  if (!videoReady) {
    setTimeout(applyVideoState, 500);
    return;
  }
  if (Math.abs(video.currentTime - videoState.time) > 0.2) {
    video.currentTime = videoState.time;
  }
  if (videoState.isPlaying && video.paused) {
    video.play().catch((e) => console.error('Play error:', e));
  } else if (!videoState.isPlaying && !video.paused) {
    video.pause();
  }
  videoContainer.classList.remove('loading');
}

ws.onmessage = function(event) {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'videoState' || data.type === 'video') {
      const serverTime = parseFloat(data.type === 'videoState' ? data.data.time : data.time);
      const isPlaying = data.type === 'videoState' ? data.data.isPlaying : data.isPlaying;
      videoState = { time: serverTime, isPlaying };
      if (!isHost) {
        applyVideoState();
      }
      lastSyncTime = Date.now();
    } else if (data.type === 'chat') {
      displayMessage(data.message);
    } else if (data.type === 'chatHistory') {
      data.messages.forEach(displayMessage);
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
    } else if (data.type === 'hostStatus') {
      isHost = data.isHost;
      video.controls = isHost;
      if (!isHost) {
        video.load();
        applyVideoState();
      }
    }
  } catch (e) {
    console.error('WebSocket message error:', e);
  }
};

if (isHost) {
  video.addEventListener('play', syncVideoState);
  video.addEventListener('pause', syncVideoState);
  video.addEventListener('seeked', syncVideoState);
  video.addEventListener('timeupdate', () => {
    if (Date.now() - lastSyncTime > syncInterval) {
      syncVideoState();
    }
  });
}

video.addEventListener('loadedmetadata', () => {
  videoReady = true;
  applyVideoState();
});

video.addEventListener('canplay', () => {
  videoContainer.classList.remove('loading');
});

video.addEventListener('error', (e) => {
  console.error('Video error:', e);
  videoContainer.classList.add('loading');
});

video.addEventListener('loadstart', () => {
  videoContainer.classList.add('loading');
});

chatMessages.addEventListener('DOMNodeInserted', () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

ws.onopen = function() {
  video.load();
  videoContainer.classList.add('loading');
  ws.send(JSON.stringify({ type: 'username', username }));
};
