const HTTP_URL      = '/tp1/graphql';
const WS_URL        = 'ws://localhost:8088/tp1/graphql-ws';
const CLIENT_ID     = 'demo-client';
const CLIENT_SECRET = 'demo-secret-2024';

export async function gqlRequest(query, variables = {}) {
  const res = await fetch(HTTP_URL, {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Client-Id':     CLIENT_ID,
      'X-Client-Secret': CLIENT_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

/**
 * Crée UNE seule connexion WebSocket et y attache plusieurs subscriptions.
 * Retourne { addSub, close, onStatusChange }
 */
export function createWsClient(onStatusChange) {
  const socket = new WebSocket(WS_URL, ['graphql-ws']);
  const handlers = {}; // id → { onData, onError }
  let idCounter = 1;
  let status = 'connecting';

  const setStatus = (s) => { status = s; onStatusChange?.(s); };

  socket.onopen = () => {
    setStatus('connected');
    socket.send(JSON.stringify({ type: 'connection_init', payload: {} }));
  };

  socket.onerror = () => setStatus('error');
  socket.onclose = () => setStatus('closed');

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'connection_ack') {
      setStatus('connected');
      return;
    }
    if (msg.type === 'ka') return; // keep-alive

    const handler = handlers[msg.id];
    if (!handler) return;
    if (msg.type === 'data' && msg.payload?.data) handler.onData(msg.payload.data);
    if (msg.type === 'error') handler.onError?.(msg.payload);
  };

  const addSub = (query, onData, onError) => {
    const id = String(idCounter++);
    handlers[id] = { onData, onError };

    const start = () => socket.send(JSON.stringify({
      id, type: 'start', payload: { query }
    }));

    if (socket.readyState === WebSocket.OPEN) {
      start();
    } else {
      socket.addEventListener('open', start, { once: true });
    }

    return () => {
      delete handlers[id];
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ id, type: 'stop' }));
      }
    };
  };

  const close = () => {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };

  return { addSub, close };
}

// Garde l'ancienne fonction pour compatibilité avec Products/Orders
export function gqlSubscribe(query, onData, onError) {
  const { addSub, close } = createWsClient();
  const unsub = addSub(query, onData, onError);
  return () => { unsub(); close(); };
}
