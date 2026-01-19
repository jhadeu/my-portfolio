/* -----------------------------------------------------
   OPEN WINDOWS ON DOUBLE-CLICK (centered opening)
------------------------------------------------------ */

document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const target = icon.dataset.window;
    if (!target) return;

    const win = document.getElementById(target);
    if (!win) return;

    win.classList.add('open');
    win.style.display = 'block';

    // Positionner au centre
    const centerX = (window.innerWidth - win.offsetWidth) / 2;
    const centerY = (window.innerHeight - win.offsetHeight) / 2;

    win.style.left = centerX + "px";
    win.style.top = centerY + "px";

    addToTaskbar(target.replace("window-", ""));
  });
});

/* -----------------------------------------------------
   DRAG WINDOWS
------------------------------------------------------ */

document.querySelectorAll('.window').forEach(win => {
  const header = win.querySelector('.window-header');
  let offsetX, offsetY;

  header.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    function move(e) {
      win.style.left = e.clientX - offsetX + 'px';
      win.style.top = e.clientY - offsetY + 'px';
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', move);
    }, { once: true });
  });
});

/* -----------------------------------------------------
   MINIMIZE & CLOSE HANDLERS
------------------------------------------------------ */

document.querySelectorAll('.window').forEach(win => {
  win.querySelectorAll('.minimize').forEach(btn => {
    btn.addEventListener('click', () => {
      win.style.display = 'none';
    });
  });

  const closeBtn = win.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      win.classList.remove('open');
      win.style.display = 'none';
    });
  }
});

/* -----------------------------------------------------
   TASKBAR HANDLING
------------------------------------------------------ */

function addToTaskbar(name) {
  if (document.getElementById(`task-${name}`)) return;

  const btn = document.createElement('div');
  btn.id = `task-${name}`;
  btn.className = 'task-btn';
  btn.textContent = name;

  btn.onclick = () => {
    const win = document.getElementById(`window-${name}`);
    win.style.display = 'block';
    win.classList.add('open');
  };

  document.getElementById('taskbar').appendChild(btn);
}


['presentation', 'skills', 'software', 'mydigitalself'].forEach((name, index) => {
    const win = document.getElementById(`window-${name}`);
    win.classList.add('open');
    win.style.display = 'block';
    addToTaskbar(name);

    if (name === 'presentation') {
        
        win.style.top = '80px'; 
        win.style.left = '150px';
        
    } else {
        
        win.style.top = `calc(50% - ${win.offsetHeight / 2}px)`;
        win.style.left = `calc(50% - ${win.offsetWidth / 2}px + ${index * 30}px)`; 
    }
});

const myDigitalSelfWindow = document.getElementById('window-mydigitalself');
if (myDigitalSelfWindow) {
  myDigitalSelfWindow.classList.add('active');
  
  myDigitalSelfWindow.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
    