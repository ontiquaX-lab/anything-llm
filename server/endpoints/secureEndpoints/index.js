const express = require("express");
const fs = require("fs");

function secureEndpoints(router) {
  if (!router) return;

  // router.use('/ppt-plugin', express.static("/Users/tim/Documents/anythingllm-msoffice-addins/powerpoint/dist", {
  //   extensions: ["js", "xml", "css", "json", "map", "png"],
  //   setHeaders: (res) => {
  //     res.removeHeader("X-Powered-By");
  //   },
  // }));

  // router.get('/ping', (_, response) => {
  //   response.send('pong');
  // });

  router.get('/ppt-plugin/taskpane.html', (req, response) => {
    console.log('taskpane.html');
    const fileContent = fs
      .readFileSync("/Users/tim/Documents/anythingllm-msoffice-addins/powerpoint/dist/taskpane.html", "utf-8")
      .replace('"{{ANYTHINGLLM_HOST}}"', JSON.stringify({ host: 'http://localhost:3001' }));
    return response.send(fileContent);
  });

  router.get('/ppt-plugin', (req, response) => {
    console.log('ppt-plugin');
    const fileContent = fs
      .readFileSync("/Users/tim/Documents/anythingllm-msoffice-addins/powerpoint/dist/taskpane.html", "utf-8")
      .replace('"{{ANYTHINGLLM_HOST}}"', JSON.stringify({ host: 'http://localhost:3001' }));
    return response.send(fileContent);
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
