// This file enables persistent storage for your Electron app using electron-store
const Store = require('electron-store');
const { contextBridge, ipcRenderer } = require('electron');

const store = new Store();

contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  delete: (key) => store.delete(key)
});
