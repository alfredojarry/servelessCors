export default async function handler(request, response) {
  const https = require('https');

  let query = Object.entries(request.query);
  query.shift();

  let url = request.query.url;
  query.forEach(entry => {
    url += '&' + entry[0] + '=' + entry[1];
  });

  try {
    const { status, headers, data } = await getRequest(url);

    // Ajout des headers CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', headers['content-type'] || 'application/octet-stream');
    response.setHeader('Content-Disposition', 'attachment; filename="fichier.mp3"');

    response.status(status).send(data);

  } catch (error) {
    response.status(500).send({ error: 'Internal server error', details: error.message });
  }

  function getRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (resp) => {
        let data = [];
        resp.on('data', (chunk) => {
          data.push(chunk);
        });
        resp.on('end', () => {
          resolve({
            status: resp.statusCode,
            headers: resp.headers,
            data: Buffer.concat(data)
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }
}
