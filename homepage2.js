/* -----------------------------------------------------
   OPEN WINDOWS ON DOUBLE-CLICK (centered opening)
   Marche pour les icônes du bureau ET les dossiers
   dans la fenêtre Projects
------------------------------------------------------ */

let topZ = 101; // au-dessus de mydigitalself (z-index 100)

function bringToFront(win) {
  topZ += 1;
  win.style.zIndex = topZ;
}

document.querySelectorAll('.desktop-icon, .folder-icon').forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const target = icon.dataset.window;
    if (!target) return;

    const win = document.getElementById(target);
    if (!win) return;

    win.classList.add('open');
    win.style.display = 'block';

    const parent = icon.closest('.window');
    const side = icon.dataset.side;

    if (parent && side) {
      // Dossier : s'ouvre à gauche ou à droite de la fenêtre Projects
      const gap = 5;   // 5px entre la fenêtre Projects et les deux autres
      const edge = 10; // marge de sécurité avec le bord de l'écran

      let x = side === 'left'
        ? parent.offsetLeft - win.offsetWidth - gap
        : parent.offsetLeft + parent.offsetWidth + gap;

      // Centrée verticalement par rapport à la fenêtre Projects
      let y = parent.offsetTop + (parent.offsetHeight - win.offsetHeight) / 2;

      // Ne pas sortir de l'écran
      x = Math.max(edge, Math.min(x, window.innerWidth - win.offsetWidth - edge));
      y = Math.max(edge, Math.min(y, window.innerHeight - win.offsetHeight - edge));

      win.style.left = x + "px";
      win.style.top = y + "px";
    } else {
      // Icône du bureau (dont Projects) : positionnée au centre
      const centerX = (window.innerWidth - win.offsetWidth) / 2;
      const centerY = (window.innerHeight - win.offsetHeight) / 2;

      win.style.left = centerX + "px";
      win.style.top = centerY + "px";
    }

    bringToFront(win);
    addToTaskbar(target.replace("window-", ""));
  });
});

/* -----------------------------------------------------
   DRAG WINDOWS
------------------------------------------------------ */

document.querySelectorAll('.window').forEach(win => {
  const header = win.querySelector('.window-header');
  let offsetX, offsetY;

  // Clic n'importe où sur la fenêtre = passe au premier plan
  win.addEventListener('mousedown', () => bringToFront(win));

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
    bringToFront(win);
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
