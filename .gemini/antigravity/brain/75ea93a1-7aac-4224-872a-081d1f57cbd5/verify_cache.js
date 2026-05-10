const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTest = async () => {
  try {
    const email = `testuser_${Date.now()}@example.com`;
    console.log(`1. Signing up user: ${email}...`);
    const signupRes = await request('POST', '/auth/signup', {
      name: 'Test User',
      email,
      password: 'password123',
    });

    if (signupRes.status !== 201) {
      console.error('Signup failed:', signupRes.data);
      return;
    }
    const token = signupRes.data.accessToken;
    console.log('✅ Signup successful');

    console.log('\n2. Calling GET /meetings (First time)...');
    const get1 = await request('GET', '/meetings', null, token);
    console.log('Status:', get1.status);
    console.log('fromCache:', get1.data.fromCache);

    console.log('\n3. Calling GET /meetings (Second time)...');
    const get2 = await request('GET', '/meetings', null, token);
    console.log('Status:', get2.status);
    console.log('fromCache:', get2.data.fromCache);

    console.log('\n4. Creating a new meeting...');
    const createRes = await request('POST', '/meetings', {
      title: 'Test Meeting',
      description: 'Verifying cache invalidation',
    }, token);
    console.log('Status:', createRes.status);
    console.log('Message:', createRes.data.message);

    console.log('\n5. Calling GET /meetings (After creation)...');
    const get3 = await request('GET', '/meetings', null, token);
    console.log('Status:', get3.status);
    console.log('fromCache:', get3.data.fromCache);

  } catch (err) {
    console.error('Test error:', err);
  }
};

runTest();
