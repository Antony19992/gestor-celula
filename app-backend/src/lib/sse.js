const clients = new Set();

function subscribe(res) {
  clients.add(res);
}

function unsubscribe(res) {
  clients.delete(res);
}

function broadcast(eventName, data) {
  if (clients.size === 0) return;
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}

module.exports = { subscribe, unsubscribe, broadcast };
