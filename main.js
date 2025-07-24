const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'src/preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'assets/icon.png'), // You can add an icon later
        show: false // Don't show until ready-to-show
    });

    // Load the app
    mainWindow.loadFile('src/index.html');

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    // if (process.env.NODE_ENV === 'development') {
    //     mainWindow.webContents.openDevTools();
    // }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Set up auto updater
    // Auto-update: check for updates on app ready
    mainWindow.webContents.on('did-finish-load', () => {
        if (process.env.NODE_ENV !== 'development') {
            autoUpdater.checkForUpdatesAndNotify();
        }
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS it is common for applications to stay active until the user quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Create application menu
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Calculation',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    mainWindow.webContents.send('new-calculation');
                }
            },
            { type: 'separator' },
            {
                label: 'Check for Updates...',
                accelerator: 'CmdOrCtrl+U',
                click: () => {
                    checkForUpdates();
                }
            },
            { type: 'separator' },
            {
                label: 'Exit',
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Check for Updates...',
                click: () => {
                    checkForUpdates();
                }
            },
            { type: 'separator' },
            {
                label: 'About Income Calculator',
                click: () => {
                    showAboutDialog();
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Auto updater functions
function setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.checkForUpdatesAndNotify();
    
    // Auto updater events
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    });
    
    autoUpdater.on('update-available', (info) => {
        console.log('Update available.');
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: 'A new version is available!',
            detail: `Version ${info.version} is ready to download. The update will be downloaded in the background.`,
            buttons: ['OK']
        });
    });
    
    autoUpdater.on('update-not-available', (info) => {
        console.log('Update not available.');
        if (mainWindow) mainWindow.webContents.send('update-not-available');
    });
    
    autoUpdater.on('error', (err) => {
        console.log('Error in auto-updater. ' + err);
    });
    
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        console.log(log_message);
        
        // Send progress to renderer if needed
        if (mainWindow) {
            mainWindow.webContents.send('update-progress', progressObj);
        }
    });
    
    autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded');
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: 'Update downloaded!',
            detail: 'The application will restart to apply the update.',
            buttons: ['Restart Now', 'Later']
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });
}
autoUpdater.on('update-available', () => {
    if (mainWindow) mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

function checkForUpdates() {
    if (mainWindow) {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Checking for Updates',
            message: 'Checking for updates...',
            detail: 'Please wait while we check for the latest version.',
            buttons: ['OK']
        });
    }
    
    autoUpdater.checkForUpdatesAndNotify().then((result) => {
        if (!result || !result.updateInfo) {
            // No updates available
            setTimeout(() => {
                if (mainWindow) {
                    mainWindow.webContents.send('update-not-available');
                }
            }, 1000);
        }
    }).catch((error) => {
        console.log('Error checking for updates:', error);
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Update Check Failed',
                message: 'Failed to check for updates',
                detail: 'Please check your internet connection and try again later.',
                buttons: ['OK']
            });
        }
    });
}

function showAboutDialog() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'About Calculator Venituri',
        message: 'Calculator Venituri v1.0.0',
        detail: 'A simple income and expense calculator for personal use.\n\nBuilt with Electron and JavaScript.\n\nFeatures:\n• Monthly salary calculations\n• Organized expense tracking\n• Real-time Romanian RON calculations\n• Automatic updates',
        buttons: ['OK']
    });
}

// IPC handlers for update functionality
ipcMain.handle('check-for-updates', () => {
    checkForUpdates();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
