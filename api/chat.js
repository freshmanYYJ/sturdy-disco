const https = require('https');

const ARK_API_HOST = process.env.ARK_API_HOST || 'ark.cn-beijing.volces.com';
const ARK_API_PATH = process.env.ARK_API_PATH || '/api/v3/responses';
const ARK_API_KEY = process.env.ARK_API_KEY;
const MODEL = process.env.MODEL;

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  if (!ARK_API_KEY || !MODEL) {
    res.status(500).json({ error: 'Server configuration error: Missing API credentials' });
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const requestData = JSON.parse(body);
      const userMessage = requestData.message;

      if (!userMessage) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const arkRequestBody = {
        model: MODEL,
        stream: true,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: userMessage
              }
            ]
          }
        ]
      };

      const options = {
        hostname: ARK_API_HOST,
        port: 443,
        path: ARK_API_PATH,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ARK_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        
        proxyRes.on('data', (chunk) => {
          res.write(chunk);
        });
        
        proxyRes.on('end', () => {
          res.end();
        });
        
        proxyRes.on('error', (e) => {
          console.error('Proxy response error:', e.message);
          res.status(502).json({ error: 'Proxy error' });
        });
      });

      proxyReq.setTimeout(60000, () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: 'API request timeout' });
        }
      });

      proxyReq.on('error', (error) => {
        console.error('Proxy request error:', error.message);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Failed to connect to AI service' });
        }
      });

      proxyReq.write(JSON.stringify(arkRequestBody));
      proxyReq.end();

    } catch (error) {
      console.error('Error handling request:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};