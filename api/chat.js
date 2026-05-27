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

  if (!ARK_API_KEY) {
    console.error('ERROR: ARK_API_KEY environment variable is not set');
    res.status(500).json({ error: 'Server configuration error: ARK_API_KEY is missing' });
    return;
  }

  if (!MODEL) {
    console.error('ERROR: MODEL environment variable is not set');
    res.status(500).json({ error: 'Server configuration error: MODEL is missing' });
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      console.log('Received request body:', body.length, 'bytes');
      
      if (!body) {
        res.status(400).json({ error: 'Empty request body' });
        return;
      }

      const requestData = JSON.parse(body);
      const userMessage = requestData.message;

      if (!userMessage) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      console.log('User message:', userMessage.substring(0, 50), '...');

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

      console.log('Making request to ARK API...');

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
        console.log('ARK API response status:', proxyRes.statusCode);
        
        res.status(proxyRes.statusCode);
        
        proxyRes.on('data', (chunk) => {
          try {
            res.write(chunk);
          } catch (e) {
            console.error('Error writing response:', e.message);
          }
        });
        
        proxyRes.on('end', () => {
          console.log('ARK API response ended');
          try {
            res.end();
          } catch (e) {
            console.error('Error ending response:', e.message);
          }
        });
        
        proxyRes.on('error', (e) => {
          console.error('Proxy response error:', e.message);
          if (!res.headersSent) {
            res.status(502).json({ error: 'Proxy error: ' + e.message });
          }
        });
      });

      proxyReq.setTimeout(60000, () => {
        console.error('Request timeout');
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: 'API request timeout' });
        }
      });

      proxyReq.on('error', (error) => {
        console.error('Proxy request error:', error.message);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Failed to connect to AI service: ' + error.message });
        }
      });

      proxyReq.write(JSON.stringify(arkRequestBody));
      proxyReq.end();

      console.log('Request sent to ARK API');

    } catch (error) {
      console.error('Error handling request:', error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error: ' + error.message });
      }
    }
  });
};