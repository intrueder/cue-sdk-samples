const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

let window = null

// Wait until the app is ready
app.once('ready', () => {
  // Create a new window
  window = new BrowserWindow({
    width: 800,
    height: 600,
    // set the title bar style
    titleBarStyle: 'hiddenInset',
    // set the background color to black
    backgroundColor: "#111",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js")
    }
  })

  window.loadURL('file:///' + path.join(__dirname, 'index.html'))

  window.once('ready-to-show', () => {
    window.show()
  })
})
