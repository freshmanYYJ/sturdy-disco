const http = require('http');
const https = require('https');

const PORT = 3000;

const ARK_API_HOST = 'ark.cn-beijing.volces.com';
const ARK_API_PATH = '/api/v3/responses';
const ARK_API_KEY = 'ark-4c1bc0b9-0fb2-47f8-ad9f-ff5465707816-f00ae';
const MODEL = 'ep-20260527224928-8l7db';

let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;
  console.log(`[${requestCount}] ====== NEW REQUEST ======`);
  console.log(`[${requestCount}] Request: ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.method === 'OPTIONS') {
    console.log(`[${requestCount}] OPTIONS request, returning 200`);
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        console.log(`[${requestCount}] Request body received: ${body.length} bytes`);
        
        const requestData = JSON.parse(body);
        const userMessage = requestData.message;

        if (!userMessage) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Message is required' }));
          console.log(`[${requestCount}] Error: Message is required`);
          return;
        }

        console.log(`[${requestCount}] User message: ${userMessage}`);

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

        console.log(`[${requestCount}] Making request to ARK API...`);

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
          console.log(`[${requestCount}] ARK API Response Status: ${proxyRes.statusCode}`);
          
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'text/plain; charset=utf-8'
          });
          
          proxyRes.on('data', (chunk) => {
            try {
              res.write(chunk);
            } catch (e) {
              console.error(`[${requestCount}] Error writing response:`, e.message);
            }
          });
          
          proxyRes.on('end', () => {
            console.log(`[${requestCount}] ARK API response ended`);
            try {
              res.end();
            } catch (e) {
              console.error(`[${requestCount}] Error ending response:`, e.message);
            }
          });
          
          proxyRes.on('error', (e) => {
            console.error(`[${requestCount}] Proxy response error:`, e.message);
          });
        });

        proxyReq.setTimeout(60000, () => {
          console.log(`[${requestCount}] Request timeout`);
          proxyReq.destroy();
          if (!res.headersSent) {
            res.writeHead(504);
            res.end(JSON.stringify({ error: 'API request timeout' }));
          }
        });

        proxyReq.on('error', (error) => {
          console.error(`[${requestCount}] Proxy request error:`, error.message);
          if (!res.headersSent) {
            res.writeHead(502);
            res.end(JSON.stringify({ error: 'Failed to connect to AI service: ' + error.message }));
          }
        });

        proxyReq.write(JSON.stringify(arkRequestBody));
        proxyReq.end();

        console.log(`[${requestCount}] Request sent to ARK API`);

      } catch (error) {
        console.error(`[${requestCount}] Error handling request:`, error.message);
        try {
          if (!res.headersSent) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error: ' + error.message }));
          }
        } catch (e) {
          console.error(`[${requestCount}] Error sending error response:`, e.message);
        }
      }
    });
    
    req.on('error', (error) => {
      console.error(`[${requestCount}] Request error:`, error.message);
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    console.log(`[${requestCount}] 404 Not Found`);
  }
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Life Coach AI Server running at http://localhost:${PORT}/`);
  console.log(`=========================================`);
  console.log('请保持此窗口打开，否则服务器会停止');
  console.log('');
  console.log('然后在浏览器中打开 index.html 文件');
  console.log('=========================================');
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason.message || reason);
});

console.log('Server starting...');