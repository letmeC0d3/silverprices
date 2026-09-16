import { describe, it } from 'node:test';
import assert from 'node:assert';
import { verifyCronSecret } from '../lib/cron-utils';

describe('Cron Endpoint Authentication Security', () => {
  const testSecret = 'test-secret-key-12345';

  it('rejects requests with missing authorization credentials', () => {
    const req = new Request('http://localhost:3000/api/cron/snapshot', {
      method: 'POST',
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.reason, 'Missing authorization credentials');
  });

  it('rejects requests with incorrect Bearer token', () => {
    const req = new Request('http://localhost:3000/api/cron/snapshot', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer wrong-secret',
      },
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.reason, 'Invalid authorization token');
  });

  it('accepts requests with correct Authorization: Bearer <CRON_SECRET> for POST', () => {
    const req = new Request('http://localhost:3000/api/cron/snapshot', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testSecret}`,
      },
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, true);
  });

  it('accepts requests with correct Authorization: Bearer <CRON_SECRET> for GET', () => {
    const req = new Request('http://localhost:3000/api/cron/snapshot', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testSecret}`,
      },
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, true);
  });

  it('strictly rejects query parameter ?secret= if Authorization header is absent', () => {
    const req = new Request(`http://localhost:3000/api/cron/snapshot?secret=${testSecret}`, {
      method: 'POST',
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.reason, 'Missing authorization credentials');
  });

  it('strictly rejects GET with query parameter ?secret= if Authorization header is absent', () => {
    const req = new Request(`http://localhost:3000/api/cron/snapshot?secret=${testSecret}`, {
      method: 'GET',
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.reason, 'Missing authorization credentials');
  });

  it('strictly rejects request with ?secret= and an invalid Authorization header', () => {
    const req = new Request(`http://localhost:3000/api/cron/snapshot?secret=${testSecret}`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer wrong-secret',
      },
    });
    const result = verifyCronSecret(req, testSecret, true);
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.reason, 'Invalid authorization token');
  });

  it('fails closed in production if CRON_SECRET is missing', () => {
    const req = new Request('http://localhost:3000/api/cron/snapshot', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer any-token',
      },
    });
    const result = verifyCronSecret(req, undefined, true);
    assert.strictEqual(result.authorized, false);
    assert.match(result.reason || '', /CRON_SECRET is required in production/);
  });
});
