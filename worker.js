const DEFAULT_JAAS_APP_ID = 'vpaas-magic-cookie-40aa8f8eaa4b44919530d6a192485f88';
const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'geolocation=(), payment=(), usb=(), bluetooth=(), clipboard-read=(), camera=(self), microphone=(self), fullscreen=(self)',
  'content-security-policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://drive.google.com https://*.google.com https://8x8.vc https://*.8x8.vc https://meet.jit.si",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://8x8.vc https://*.8x8.vc",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https:",
    "worker-src 'self'",
    "manifest-src 'self'"
  ].join('; ')
};

function withSecurityHeaders(response) {
  const secured = new Response(response.body, response);

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (!secured.headers.has(key)) {
      secured.headers.set(key, value);
    }
  });

  return secured;
}

function jsonResponse(data, status = 200) {
  return withSecurityHeaders(new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  }));
}

function base64UrlEncode(input) {
  const bytes = input instanceof Uint8Array
    ? input
    : new TextEncoder().encode(input);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function pemToArrayBuffer(pem) {
  const base64 = String(pem || '')
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function normalizeRoomName(value, appId) {
  const input = String(value || '').trim();

  if (!input) {
    return '';
  }

  try {
    const parsed = new URL(input);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[0] === appId && parts[1] ? parts[1] : (parts.pop() || '');
  } catch (error) {
    const parts = input.split('/').filter(Boolean);
    return parts[0] === appId && parts[1] ? parts[1] : (parts.pop() || '');
  }
}

async function signJwt(payload, env) {
  const appId = env.JAAS_APP_ID || DEFAULT_JAAS_APP_ID;
  const kid = env.JAAS_KID || '';
  const privateKey = env.JAAS_PRIVATE_KEY || '';

  if (!kid || !privateKey) {
    throw new Error('Configure os secrets JAAS_KID e JAAS_PRIVATE_KEY no Cloudflare.');
  }

  const header = {
    alg: 'RS256',
    kid,
    typ: 'JWT'
  };
  const tokenPayload = {
    ...payload,
    sub: appId
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(tokenPayload))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function handleJaasToken(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Metodo nao permitido.' }, 405);
  }

  try {
    const appId = env.JAAS_APP_ID || DEFAULT_JAAS_APP_ID;
    const body = await request.json();
    const room = normalizeRoomName(body.roomName, appId);
    const displayName = String(body.displayName || 'Convidado').slice(0, 80);
    const isModerator = Boolean(body.moderator);
    const now = Math.floor(Date.now() / 1000);

    if (!room || !/^[A-Za-z0-9_-]{3,120}$/.test(room)) {
      return jsonResponse({ error: 'Sala invalida.' }, 400);
    }

    const jwt = await signJwt({
      aud: 'jitsi',
      iss: 'chat',
      nbf: now - 10,
      exp: now + 60 * 60 * 4,
      room,
      context: {
        user: {
          id: crypto.randomUUID(),
          name: displayName,
          moderator: isModerator ? 'true' : 'false'
        },
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          'outbound-call': false
        },
        room: {
          regex: false
        }
      }
    }, env);

    return jsonResponse({ jwt, roomName: `${appId}/${room}` });
  } catch (error) {
    return jsonResponse({
      error: error.message || 'Nao consegui gerar o token JaaS.'
    }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/jaas-token') {
      return handleJaasToken(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  }
};
