// ===== Chat widget: builds its own HTML, so you only need to add this file =====
(function () {
  // Styles are injected from here, so no separate CSS file is needed
  const style = document.createElement('style');
  style.textContent = `
/* ===== Chat widget (floating pink icon + one-color window) ===== */

:root {
  --chat-pink: #fa87b0;
  /* Same colors as the .window styles of the site */
  --chat-win-bg: rgb(253, 238, 244);
  --chat-win-header: rgb(253, 218, 238);
  --chat-win-border: rgb(245, 172, 196);
  --chat-win-text: #f580a7;
  /* Distance from the bottom of the screen. Increase it if you add a taskbar. */
  --chat-bottom: 20px;
}

#chat-launcher {
  position: fixed;
  right: 20px;
  bottom: var(--chat-bottom);
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--chat-pink);
  border: 2px solid var(--chat-win-border);
  border-radius: 50%;
  box-shadow: none;
  cursor: pointer;
  z-index: 9999;
  transition: transform 0.1s;
}

#chat-launcher:hover {
  transform: scale(1.08);
}

#chat-launcher:active {
  transform: scale(0.95);
}

#chat-launcher svg {
  width: 28px;
  height: 28px;
  fill: #fff;
}

#chat-panel {
  position: fixed;
  right: 20px;
  bottom: calc(var(--chat-bottom) + 64px);
  width: 280px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - var(--chat-bottom) - 100px);
  max-height: calc(100dvh - var(--chat-bottom) - 100px);
  display: none;
  flex-direction: column;
  overflow: hidden;
  background: var(--chat-win-bg);
  border: 2px solid var(--chat-win-border);
  border-radius: 8px;
  box-shadow: none;
  font-family: inherit;
  z-index: 9999;
}

#chat-panel.open {
  display: flex;
}

#chat-panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--chat-win-header);
  color: inherit;
  border-bottom: 2px solid var(--chat-win-border);
}

/* Title underlined, like the other window titles */
#chat-panel-header span {
  text-decoration: underline;
}

/* Remove the browser's default button frame around the heart */
#chat-close {
  -webkit-appearance: none;
  appearance: none;
  background: none;
  border: none;
  box-shadow: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-family: inherit;
  cursor: pointer;
}

#chat-close:focus {
  outline: none;
}

/* Only used if the heart button of the other windows can't be found */
#chat-close.fallback {
  color: inherit;
  font-size: 20px;
  line-height: 1;
}

#chat-log {
  height: 220px;
  flex: 1 1 auto;
  min-height: 80px;
  overflow-y: auto;
  padding: 4px 12px;
  background: var(--chat-win-bg);
  scrollbar-width: thin;
  scrollbar-color: rgb(245, 172, 196) transparent;
}

#chat-log p {
  margin: 0 0 6px;
  padding: 0;
  word-wrap: break-word;
}

.msg-user {
  color: var(--chat-win-text);
}

.msg-bot {
  color: #333;
}

#chat-form {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding: 8px 12px 12px;
  background: var(--chat-win-bg);
  border-top: 2px solid var(--chat-win-border);
}

#chat-input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  background: transparent;
  color: #333;
  border: 2px solid var(--chat-win-border);
  border-radius: 6px;
  padding: 4px 6px;
}

#chat-send {
  font-family: inherit;
  background: transparent;
  color: var(--chat-win-text);
  border: 2px solid var(--chat-win-border);
  border-radius: 6px;
  cursor: pointer;
}

#chat-send:hover {
  background: var(--chat-win-border);
  color: #fff;
}

#chat-send:disabled {
  opacity: 0.6;
  cursor: wait;
}
  `;
  document.head.appendChild(style);
  const widget = document.createElement('div');
  widget.innerHTML = `
    <button id="chat-launcher" aria-label="Open chat assistant" title="Chat with my assistant">
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      </svg>
    </button>
    <div id="chat-panel" role="dialog" aria-label="Chat assistant">
      <div id="chat-panel-header" class="window-header">
        <span>Assistant.exe</span>
        <button id="chat-close" class="fallback" aria-label="Close chat">&#9825;</button>
      </div>
      <div id="chat-log"></div>
      <div id="chat-form">
        <input id="chat-input" type="text" placeholder="Ask me something..." maxlength="300" />
        <button id="chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const launcher = widget.querySelector('#chat-launcher');
  const panel = widget.querySelector('#chat-panel');
  const closeBtn = widget.querySelector('#chat-close');

  // Copy the heart button of the other windows, so it has the exact same look and font
  const refButtons = Array.from(document.querySelectorAll('.window .window-header button, .window .window-header .close, .window .window-header .minimize'));
  const ref = refButtons.find(b => /[\u2661\u2665\u2764]/.test(b.textContent)) || refButtons[0];
  if (ref) {
    closeBtn.className = ref.className;
    closeBtn.innerHTML = ref.innerHTML;
  }
  const chatLog = widget.querySelector('#chat-log');
  const chatInput = widget.querySelector('#chat-input');
  const chatSend = widget.querySelector('#chat-send');
  const chatHistory = [];
  let welcomed = false;

  function addMsg(who, text) {
    const p = document.createElement('p');
    p.className = who === 'Me' ? 'msg-user' : 'msg-bot';
    p.textContent = `${who}: ${text}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
    return p;
  }

  function openChat() {
    panel.classList.add('open');
    if (!welcomed) {
      addMsg('Assistant', "Hi! I'm Jade's assistant. Ask me about her projects or skills!");
      welcomed = true;
    }
    chatInput.focus();
  }

  function closeChat() {
    panel.classList.remove('open');
  }

  launcher.addEventListener('click', () => {
    panel.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  async function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatSend.disabled = true;
    addMsg('Me', text);
    chatHistory.push({ role: 'user', content: text });

    const loading = addMsg('Assistant', '...');

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: chatHistory })
      });
      const data = await res.json();
      loading.remove();
      chatHistory.push({ role: 'assistant', content: data.reply });
      addMsg('Assistant', data.reply);
    } catch (e) {
      loading.remove();
      addMsg('Assistant', "Oops, I can't answer right now. Try again in a bit!");
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
})();