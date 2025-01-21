const express = require("express");
const fs = require("fs");
const path = require("path");
const msofficePluginPath = path.resolve(__dirname, '..', '..', 'storage', 'plugins', 'msoffice');

function loadMSOfficePlugins(router) {
  const files = fs.readdirSync(msofficePluginPath);
  files.forEach((folder) => {
    if (!fs.statSync(path.resolve(msofficePluginPath, folder)).isDirectory()) return;
    const pluginTypeFileLocation = path.resolve(msofficePluginPath, folder, '.type');
    if (!fs.existsSync(pluginTypeFileLocation)) return;

    const [pluginType, pluginId] = fs.readFileSync(pluginTypeFileLocation, 'utf-8').split('\n');
    if (!['msoffice/powerpoint', 'msoffice/word', 'msoffice/excel'].includes(pluginType)) return;

    console.log(`Dynamically loading plugin: ${folder} of type: ${pluginType} with id: ${pluginId}`);
    const metadata = path.resolve(msofficePluginPath, folder, 'manifest.xml');

    if (!fs.existsSync(metadata)) {
      const template = path.resolve(msofficePluginPath, folder, 'manifest.template');
      if (!fs.existsSync(template)) return;
      console.error(`Metadata file not found for plugin: ${folder} - generating from template...`);
      const templateContent = fs.readFileSync(template, 'utf-8');
      const newMetadata = templateContent
        .replaceAll('{{PLUGIN_SERVE_FROM}}', `https://localhost:3443/ssl/${pluginType}/${pluginId}`)
        .replaceAll('{{PLUGIN_ID}}', pluginId);
      fs.writeFileSync(metadata, newMetadata);
    };

    router.use(`/${pluginType}/${pluginId}`, express.static(path.resolve(msofficePluginPath, folder)));
    router.get(`/${pluginType}/${pluginId}/taskpane.html`, (_, response) => {
      const fileContent = fs.
        readFileSync(path.resolve(msofficePluginPath, folder, 'taskpane.html'), "utf-8")
        .replaceAll('"{{ANYTHINGLLM_HOST}}"', JSON.stringify({ host: 'http://localhost:3001' }));
      return response.send(fileContent);
    });

    router.get(`/${pluginType}/${pluginId}`, (_, response) => {
      const fileContent = fs
        .readFileSync(path.resolve(msofficePluginPath, folder, 'taskpane.html'), "utf-8")
        .replaceAll('"{{ANYTHINGLLM_HOST}}"', JSON.stringify({ host: 'http://localhost:3001' }));
      return response.send(fileContent);
    });
  });
}

function secureEndpoints(router) {
  if (!router) return;
  loadMSOfficePlugins(router);
  router.get('/ping', (_, response) => {
    return response.send('pong');
  });
}

/**
 * 
 * @param {import('express').Express} expressApp 
 */
function setupSecureEndpoints(expressApp) {
  const selfsigned = require('selfsigned');
  const fs = require('fs');
  const path = require('path');

  const privateKeyPath = path.resolve(__dirname, '..', '..', 'storage', 'ssl', 'selfsigned.key');
  const certificatePath = path.resolve(__dirname, '..', '..', 'storage', 'ssl', 'selfsigned.cert');

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
    const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 365 });
    fs.mkdirSync(path.resolve(__dirname, '..', '..', 'storage', 'ssl'), { recursive: true });
    fs.writeFileSync(privateKeyPath, pems.private, { encoding: 'utf-8' });
    fs.writeFileSync(certificatePath, pems.cert, { encoding: 'utf-8' });
  }

  const httpsRouter = express.Router();
  expressApp.use("/ssl", httpsRouter);

  const https = require('https');
  const httpsServer = https.createServer({
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(certificatePath)
  }, expressApp);

  secureEndpoints(httpsRouter);
  httpsServer.listen(3443, () => {
    console.log('HTTPS server running on port 3443');
  });
}

module.exports = { secureEndpoints, setupSecureEndpoints };
