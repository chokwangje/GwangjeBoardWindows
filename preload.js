const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopStorage', {
  getItem: key => ipcRenderer.sendSync('storage-get', String(key)),
  setItem: (key, value) => {
    const ok = ipcRenderer.sendSync('storage-set', String(key), String(value));
    if (!ok) throw new Error('하드디스크 저장에 실패했습니다.');
  },
  removeItem: key => ipcRenderer.sendSync('storage-remove', String(key))
});

contextBridge.exposeInMainWorld('Android', {
  printDocument: () => ipcRenderer.invoke('print-page')
});
