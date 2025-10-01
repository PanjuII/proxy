// api/ping.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  return res.status(200).json({
    status: 'online',
    service: 'Private Server Webhook Proxy',
    version: '2.0',
    features: ['exact-link-preservation', 'animal-scanning', 'private-server-detection'],
    timestamp: new Date().toISOString()
  });
}
