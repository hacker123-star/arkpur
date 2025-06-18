// script.js
const video = document.getElementById('videoPlayer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const usernameInput = document.getElementById('username');
const replyPreview = document.getElementById('replyPreview');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
let currentReply = null;

// Load username from local storage
let username = localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`;
usernameInput.value = username;

// WebSocket connection to Glitch backend
const ws = new WebSocket('wss://wonderful-destiny-open.glitch.me:8080');

// Update username
function updateUsername() {
  const newUsername = usernameInput.value.trim();
  if (newUsername) {
    username = newUsername;
    localStorage.setItem('username', username);
    alert('Username updated!');
  }
}

// Send message
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

// Handle Enter key for sending messages
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Cancel reply
function cancelReply() {
  currentReply = null;
  replyPreview.style.display = 'none';
}

// Reply to message
function replyToMessage(message) {
  currentReply = message;
  replyUsername.textContent = message.username;
  replyText.textContent = message.text;
  replyPreview.style.display = 'flex';
  chatInput.focus();
}

// Display message
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

// WebSocket events
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'videoState') {
    video.currentTime = parseFloat(data.data.time);
    if (data.data.isPlaying) {
      video.play().catch((e) => console.error('Play error:', e));
    } else {
      video.pause();
    }
  } else if (data.type === 'video') {
    video.currentTime = parseFloat(data.time);
    if (data.isPlaying) {
      video.play().catch((e) => console.error('Play error:', e));
    } else {
      video.pause();
    }
  } else if (data.type === 'chat') {
    displayMessage(data.message);
  }
};

// Video sync events
video.addEventListener('play', () => {
  ws.send(JSON.stringify({ type: 'video', time: video.currentTime, isPlaying: true }));
});

video.addEventListener('pause', () => {
  ws.send(JSON.stringify({ type: 'video', time: video.currentTime, isPlaying: false }));
});

video.addEventListener('seeked', () => {
  ws.send(JSON.stringify({ type: 'video', time: video.currentTime, isPlaying: !video.paused }));
});

// Prevent local control conflicts
video.addEventListener('click', (e) => {
  if (e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});

// Auto-scroll chat
chatMessages.addEventListener('DOMNodeInserted', () => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Initial sync request
ws.onopen = function() {
  ws.send(JSON.stringify({ type: 'requestState' }));
};
