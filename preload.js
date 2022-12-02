const { contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
    send: (data, channel = "log::to_main") => { // レンダラーからの送信用
      ipcRenderer.send(channel, data);
    },
    on: (callback, channel = "log::from_main") => { // メインプロセスからの受信用
      ipcRenderer.on(channel, (event, args) => {
        callback(args)
      })
    }
  }
)
