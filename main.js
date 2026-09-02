const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function dataFile() {
  const folder = path.join(app.getPath('documents'), '광제보드');
  fs.mkdirSync(folder, { recursive: true });
  return path.join(folder, 'gwangje-board-data.json');
}

function readStore() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeStore(store) {
  const target = dataFile();
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(temporary, target);
}

ipcMain.on('storage-get', (event, key) => {
  const store = readStore();
  event.returnValue = Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
});

ipcMain.on('storage-set', (event, key, value) => {
  try {
    const store = readStore();
    store[key] = String(value);
    writeStore(store);
    event.returnValue = true;
  } catch (_) {
    event.returnValue = false;
  }
});

ipcMain.on('storage-remove', (event, key) => {
  try {
    const store = readStore();
    delete store[key];
    writeStore(store);
    event.returnValue = true;
  } catch (_) {
    event.returnValue = false;
  }
});

ipcMain.handle('print-page', () => {
  if (!mainWindow) return false;
  mainWindow.webContents.print({ silent: false, printBackground: true });
  return true;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 900,
    minWidth: 760,
    minHeight: 620,
    title: '광제보드',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    backgroundColor: '#ddecfb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
