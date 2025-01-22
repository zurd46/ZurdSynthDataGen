const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateDatasets: (theme, numberOfData, model, language) => {
    return ipcRenderer.invoke('generate-datasets', { theme, numberOfData, model, language });
  }
});
