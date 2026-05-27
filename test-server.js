const http = require('http');

const PORT = 3000;

let requestCount = 0;

const server = http.createServer((req, res) => {
  requestCount++;
  console.log(`[${requestCount}] ====== NEW REQUEST ======`);
  console.log(`[${requestCount}] Request: ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        console.log(`[${requestCount}] Body content: ${body}`);
        
        const requestData = JSON.parse(body);
        const userMessage = requestData.message;

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          console.log(`[${requestCount}] Error: Message is required`);
          return;
        }

        console.log(`[${requestCount}] User message: ${userMessage}`);

        // 模拟AI响应（不调用外部API）
        const response = {
          response: [
            {
              role: 'assistant',
              content: [
                {
                  type: 'text',
                  text: `你好！我是你的人生导师。你说"${userMessage}"，这让我想到了很多。人生的旅程充满了各种挑战和机遇，重要的是保持积极的心态，勇敢面对每一个困难。记住，每一次经历都是成长的机会！`
                }
              ]
            }
          ]
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        console.log(`[${requestCount}] Response sent successfully`);

      } catch (error) {
        console.error(`[${requestCount}] Error handling request:`, error.message);
        try {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
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
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    console.log(`[${requestCount}] 404 Not Found`);
  }
});

server.listen(PORT, () => {
  console.log(`Test Server running at http://localhost:${PORT}/`);
  console.log('Server PID:', process.pid);
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