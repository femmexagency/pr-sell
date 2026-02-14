const response = await fetch('https://api.sync.com.br/api/partner/v1/auth-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    client_id: '89210cff-1a37-4cd0-825d-45fecd8e77bb',
    client_secret: 'dadc1b2c-86ee-4256-845a-d1511de315bb'
  })
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Response:', JSON.stringify(data, null, 2));
