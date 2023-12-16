const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const commands = require('./commands');
const cmdMRU = require('./cmd_mru');

const portfinder = require('portfinder');
const { exec, spawn } = require('child_process');

// Keep a global reference of the window object to avoid it being garbage collected.
let win;
const SHORTCUT = 'Ctrl+Shift+Alt+P';
let backendProcess = null;


function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    // width: 800,
    // height: 600,
    // show: false, // Initially hide the window

    frame: false, // Make the window frameless
    transparent: true, // Make the window transparent
    resizable: false, // Disable resizing of the window
    show: false, // Initially hide the window

    webPreferences: {
      preload: path.join(__dirname, '../public/preload.js'),
      // other options
    },
  });

  // https://medium.com/@rbfraphael/building-desktop-apps-with-electron-next-js-without-nextron-01bbf1fdd72e
  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      console.log("Failed to load app:", code, desc);

      win.webContents.reloadIgnoringCache();
    });
  }

  // Load next js app
  // const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
  // const startUrl = `file://${path.join(__dirname, '../out/index.html')}`;

  // console.log("Start URL:", startUrl);

  // Start python backend
  // if (!isDev) {
    startBackend();
  // }

  // win.loadURL(startUrl);
  win.on('closed', () => win = null);
  win.on('blur', () => {
    win.hide();
  });

  // Maximize the window to take up the whole screen
  win.maximize();
}

function startBackend() {
  portfinder.getPort((err, port) => {
    if (err) {
      console.error("Error finding open port:", err);
      return;
    }

    console.log("Found open port:", port);

    // Get the current working directory
    const cwd = process.cwd();

    // Construct the full path to the executable
    const backendPath = `${cwd}\\backend_0p1\\backend_0p1.exe`; // Use double backslashes for Windows paths

    // const command = `${backendPath} --port ${port}`;

    // Use spawn instead of exec
    const child = spawn(backendPath, ['--port', port.toString()], { cwd: `${cwd}\\backend_0p1` });

    child.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    child.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);
    });

    // const killChildProcess = () => {
    //   console.log("Terminating child process...");
    //   process.kill(-child.pid); // Kill the entire process group
    //   process.exit();
    // };

    // // Handle various exit scenarios
    // process.on('exit', killChildProcess);
    // process.on('SIGINT', killChildProcess); // CTRL+C
    // process.on('SIGTERM', killChildProcess); // Termination request
    // process.on('uncaughtException', killChildProcess);
    // process.on('unhandledRejection', killChildProcess);


    // Add backend as issuer
    commands.add_issuer({
      name: "Backend",
      url: `http://127.0.0.1:${port}`,
    });
  });
}

function toggleWindow() {
  if (win.isVisible()) {
    win.blur();
    win.hide();
  } else {
    win.show();
    resetSearch();
  }
}

app.whenReady().then(() => {
  createWindow()

  // Register a global shortcut listener.
  const ret = globalShortcut.register(SHORTCUT, () => {
    toggleWindow();
  });

  if (!ret) {
    console.log('Registration failed');
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered(SHORTCUT));
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Unregister the global shortcut listener.
  globalShortcut.unregisterAll();

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Terminate the backend process when the app is about to close
  // console.log("Terminating backend process");
  // backendProcess.kill();
});

ipcMain.on('minimize-app', () => {
  toggleWindow();
});

ipcMain.on('run-command', async (event, command) => {

  if (command.closes_palette === false) {
    resetSearch();
  }
  else {
    // Hide the window
    toggleWindow();
  }

  // Update the MRU list
  // Send the updated MRU list to the renderer
  let mru = cmdMRU.update_cmd_MRU(command);
  win.webContents.send('mru-change', mru);

  commands.runCommand(command, win, app);
});

// Pings a series of command contributors
ipcMain.handle('get-commands', async () => {
  return commands.get_commands();
});

function resetSearch(term) {
  win.webContents.send('reset-search', term);
}