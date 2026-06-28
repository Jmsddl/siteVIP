const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

function getDriveFileId(context) {
  const fileId = decodeURIComponent(context.params.id || '');

  if (!DRIVE_FILE_ID_PATTERN.test(fileId)) {
    return '';
  }

  return fileId;
}

function buildDriveDownloadUrls(fileId, resourceKey) {
  const params = new URLSearchParams({
    id: fileId,
    export: 'download',
    confirm: 't'
  });

  if (resourceKey) {
    params.set('resourcekey', resourceKey);
  }

  const fallbackParams = new URLSearchParams({
    id: fileId,
    export: 'download'
  });

  if (resourceKey) {
    fallbackParams.set('resourcekey', resourceKey);
  }

  return [
    `https://drive.usercontent.google.com/download?${params.toString()}`,
    `https://drive.google.com/uc?${params.toString()}`,
    `https://drive.google.com/uc?${fallbackParams.toString()}`
  ];
}

function copyHeader(sourceHeaders, targetHeaders, name) {
  const value = sourceHeaders.get(name);

  if (value) {
    targetHeaders.set(name, value);
  }
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, HEAD, OPTIONS',
    'access-control-allow-headers': 'range, content-type'
  };
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Metodo nao permitido.', {
      status: 405,
      headers: {
        allow: 'GET, HEAD, OPTIONS',
        ...corsHeaders()
      }
    });
  }

  const requestUrl = new URL(request.url);
  const fileId = getDriveFileId(context);

  if (!fileId) {
    return new Response('ID do video invalido.', {
      status: 400,
      headers: corsHeaders()
    });
  }

  const resourceKey = requestUrl.searchParams.get('resourcekey') || '';
  const upstreamHeaders = new Headers({
    accept: 'video/*,*/*;q=0.9'
  });
  const range = request.headers.get('range');

  if (range) {
    upstreamHeaders.set('range', range);
  }

  let upstreamResponse = null;

  for (const driveUrl of buildDriveDownloadUrls(fileId, resourceKey)) {
    upstreamResponse = await fetch(driveUrl, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'follow'
    });

    const upstreamContentType = upstreamResponse.headers.get('content-type') || '';

    if (upstreamResponse.ok && !upstreamContentType.includes('text/html')) {
      break;
    }
  }

  const responseHeaders = new Headers({
    ...corsHeaders(),
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=3600',
    'content-disposition': 'inline'
  });

  copyHeader(upstreamResponse.headers, responseHeaders, 'content-type');
  copyHeader(upstreamResponse.headers, responseHeaders, 'content-length');
  copyHeader(upstreamResponse.headers, responseHeaders, 'content-range');
  copyHeader(upstreamResponse.headers, responseHeaders, 'etag');
  copyHeader(upstreamResponse.headers, responseHeaders, 'last-modified');

  if (!responseHeaders.has('content-type')) {
    responseHeaders.set('content-type', 'video/mp4');
  }

  const contentType = responseHeaders.get('content-type') || '';

  if (!upstreamResponse.ok || contentType.includes('text/html')) {
    return new Response('Nao consegui carregar esse video pelo proxy do Drive.', {
      status: upstreamResponse.ok ? 502 : upstreamResponse.status,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        ...corsHeaders()
      }
    });
  }

  return new Response(request.method === 'HEAD' ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders
  });
}
