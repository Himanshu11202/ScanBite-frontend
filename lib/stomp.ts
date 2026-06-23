type FrameCallback = (frame: { command: string; headers: Record<string, string>; body: string }) => void;

export class MinimalStompClient {
  private ws: WebSocket | null = null;
  private url: string;
  private subscriptions: Record<string, FrameCallback> = {};
  private isConnected = false;
  private reconnectTimeout: any = null;
  private onConnectCallback?: () => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(onConnect?: () => void) {
    console.log('[STOMP] Connecting to', this.url);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (onConnect) this.onConnectCallback = onConnect;
    
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      console.error('[STOMP] WebSocket initialization failed', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[STOMP] Socket opened, sending CONNECT...');
      this.sendFrame('CONNECT', {
        'accept-version': '1.1,1.2',
        'heart-beat': '10000,10000'
      });
    };

    this.ws.onmessage = (event) => {
      const frame = this.parseFrame(event.data);
      if (!frame) return;

      if (frame.command === 'CONNECTED') {
        this.isConnected = true;
        console.log('[STOMP] Connected successfully.');
        // Re-subscribe to all active subscriptions
        for (const destination in this.subscriptions) {
          this.sendFrame('SUBSCRIBE', {
            id: 'sub-' + destination,
            destination: destination
          });
        }
        if (this.onConnectCallback) this.onConnectCallback();
      } else if (frame.command === 'MESSAGE') {
        const dest = frame.headers['destination'];
        if (dest && this.subscriptions[dest]) {
          this.subscriptions[dest](frame);
        }
      }
    };

    this.ws.onclose = () => {
      console.log('[STOMP] Connection closed.');
      this.isConnected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[STOMP] WebSocket error:', err);
    };
  }

  subscribe(destination: string, callback: FrameCallback) {
    this.subscriptions[destination] = callback;
    if (this.isConnected) {
      this.sendFrame('SUBSCRIBE', {
        id: 'sub-' + destination,
        destination: destination
      });
    }
  }

  send(destination: string, body: string, headers: Record<string, string> = {}) {
    const allHeaders = {
      destination: destination,
      ...headers,
      'content-length': body.length.toString()
    };
    this.sendFrame('SEND', allHeaders, body);
  }

  private sendFrame(command: string, headers: Record<string, string>, body = '') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    let raw = command + '\n';
    for (const key in headers) {
      raw += key + ':' + headers[key] + '\n';
    }
    raw += '\n' + body + '\0';
    this.ws.send(raw);
  }

  private parseFrame(data: string) {
    if (!data) return null;
    const content = data.endsWith('\0') ? data.slice(0, -1) : data;
    const parts = content.split('\n\n');
    const headerLines = parts[0].split('\n');
    const command = headerLines[0].trim();
    
    const headers: Record<string, string> = {};
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i].trim();
      if (!line) continue;
      const colon = line.indexOf(':');
      if (colon !== -1) {
        headers[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
      }
    }

    const body = parts.slice(1).join('\n\n').trim();
    return { command, headers, body };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
    }
    this.isConnected = false;
  }
}
