const { contextBridge } = require('electron');
const sdk = require('cue-sdk');
const { cpus } = require('os');
contextBridge.exposeInMainWorld('os_cpus', cpus);
contextBridge.exposeInMainWorld('sdk', sdk);
