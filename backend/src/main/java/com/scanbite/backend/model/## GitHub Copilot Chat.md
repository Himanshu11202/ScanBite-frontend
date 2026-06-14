## GitHub Copilot Chat

- Extension: 0.48.1 (prod)
- VS Code: 1.120.0 (0958016b2af9f09bb4257e0df4a95e2f90590f9f)
- OS: win32 10.0.26200 x64
- GitHub Account: Himanshu11202

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (119 ms)
- DNS ipv6 Lookup: Error (116 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: http://127.0.0.1:56209 (2 ms)
- Proxy Connection: Error (50 ms): connect ECONNREFUSED 127.0.0.1:56209
- Electron fetch (configured): Error (2052 ms): Error: net::ERR_PROXY_CONNECTION_FAILED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (63 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
- Node.js fetch: Error (75 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at n._fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
    at n.fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
    at u (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
    at Ig._executeContributedCommand (file:///c:/Users/Himanshu%20patidar/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: connect ECONNREFUSED 127.0.0.1:56209
      at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)
      at TCPConnectWrap.callbackTrampoline (node:internal/async_hooks:130:17)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (1986 ms)
- DNS ipv6 Lookup: Error (70 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: http://127.0.0.1:56209 (65 ms)
- Proxy Connection: Error (18 ms): connect ECONNREFUSED 127.0.0.1:56209
- Electron fetch (configured): Error (2041 ms): Error: net::ERR_PROXY_CONNECTION_FAILED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (36 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
- Node.js fetch: Error (11 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at n._fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
    at n.fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
    at u (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
    at Ig._executeContributedCommand (file:///c:/Users/Himanshu%20patidar/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: connect ECONNREFUSED 127.0.0.1:56209
      at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)
      at TCPConnectWrap.callbackTrampoline (node:internal/async_hooks:130:17)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 4.225.11.192 (138 ms)
- DNS ipv6 Lookup: Error (65 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: http://127.0.0.1:56209 (64 ms)
- Proxy Connection: Error (183 ms): connect ECONNREFUSED 127.0.0.1:56209
- Electron fetch (configured): Error (2058 ms): Error: net::ERR_PROXY_CONNECTION_FAILED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (43 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
- Node.js fetch: Error (104 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at n._fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:5229)
    at n.fetch (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5486:4541)
    at u (c:\Users\Himanshu patidar\.vscode\extensions\github.copilot-chat-0.48.1\dist\extension.js:5518:186)
    at Ig._executeContributedCommand (file:///c:/Users/Himanshu%20patidar/AppData/Local/Programs/Microsoft%20VS%20Code/0958016b2a/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:502:48675)
  Error: connect ECONNREFUSED 127.0.0.1:56209
      at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)
      at TCPConnectWrap.callbackTrampoline (node:internal/async_hooks:130:17)

Connecting to https://mobile.events.data.microsoft.com: Error (2029 ms): Error: net::ERR_PROXY_CONNECTION_FAILED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: Error (2026 ms): Error: net::ERR_PROXY_CONNECTION_FAILED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
    at SimpleURLLoaderWrapper.callbackTrampoline (node:internal/async_hooks:130:17)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (7 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (26 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
Connecting to https://default.exp-tas.com: Error (53 ms): Error: Failed to establish a socket connection to proxies: PROXY 127.0.0.1:56209
    at PacProxyAgent.<anonymous> (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:120:19)
    at Generator.throw (<anonymous>)
    at rejected (c:\Users\Himanshu patidar\AppData\Local\Programs\Microsoft VS Code\0958016b2a\resources\app\node_modules\@vscode\proxy-agent\out\agent.js:6:65)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)

Number of system certificates: 135

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).