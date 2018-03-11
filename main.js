const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const {ipcMain} = require('electron')
const {dialog} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1340, height: 800, transparent: false, frame: true})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.setTitle('Sudoku');
  //mainWindow.openDevTools();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// Connecting with renderer
ipcMain.on('open-file', (event, arg) => {
    const fs = require('fs');
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: 'Zapis gry', extensions: ['txt']}
        ]
    }, function (files) {
        if (files !== undefined) {
            fs.readFile(files[0], 'utf-8', (err, data) => {
                //console.log(data);
                mainWindow.webContents.send('open-file-event', data);
            });
        }
    });
});
ipcMain.on('save-file', (event, arg) => {
    const fs = require('fs');
    var savePath = dialog.showSaveDialog({});
    var saveString = '';

    // parse arg
    for(let x = 0; x < 9; x++) {
        for(let y = 0; y < 9; y++) {
            if(arg[x][y] == undefined) arg[x][y] = 0;
            saveString += arg[x][y] + ((y == 8 && x == 8) ? '' : ',');
        }
    }
    console.log(saveString);
    if(savePath !== undefined) {
        fs.writeFile(savePath, saveString, function (err) {

        });
    }
});
ipcMain.on('close-app', (event, arg)=> {
    app.quit();
});
ipcMain.on('open-dev', (event, arg)=> {
    mainWindow.openDevTools();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

electron.app.on('browser-window-created',function(e,window) {
    window.setMenu(null);
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
