// Simple health check endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  return res.status(200).json({
    status: 'online',
    service: 'Delta Webhook Proxy',
    timestamp: new Date().toISOString(),
    message: 'Server is working!'
  });
}
