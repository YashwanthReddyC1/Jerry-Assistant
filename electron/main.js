import { app, BrowserWindow, dialog, shell } from 'electron';
let backend;
let backendPort;
const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) app.quit();
app.on('second-instance', () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (window) { if (window.isMinimized()) window.restore(); window.focus(); }
});

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 860,
    minHeight: 620,
    backgroundColor: '#eef6ff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (!app.isPackaged) {
    await window.loadURL(process.env.JERRY_DESKTOP_URL || 'http://localhost:5173');
    return;
  }

  process.env.NODE_ENV = 'production';
  process.env.JERRY_NO_LISTEN = 'true';
  const { app: expressApp } = await import('../server/index.js');
  if (!backend) {
    const requestedPort = process.env.JERRY_DESKTOP_PORT ? Number(process.env.JERRY_DESKTOP_PORT) : 0;
    backend = expressApp.listen(requestedPort, '127.0.0.1');
    await new Promise((resolve, reject) => {
      backend.once('listening', resolve);
      backend.once('error', reject);
    });
    backendPort = backend.address().port;
    expressApp.locals.port = backendPort;
  }
  await window.loadURL(`http://127.0.0.1:${backendPort}`);
}

app.whenReady().then(() => hasSingleInstanceLock ? createWindow() : undefined).catch(async (error) => {
  await dialog.showMessageBox({ type: 'error', title: 'Jerry could not start', message: error.message || 'Jerry could not start its local server.' });
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  backend?.close();
});
