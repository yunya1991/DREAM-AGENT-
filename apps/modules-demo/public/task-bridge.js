/** SharedWorker - cross-port task bridge.
 *  Both apps connect to this worker on the same origin (http://localhost),
 *  and it relays messages between all connected ports.
 */
const ports = []
let latestTasks = null

self.onconnect = (e) => {
  const port = e.ports[0]
  ports.push(port)

  // Send latest tasks to newly connected port
  if (latestTasks) {
    port.postMessage(latestTasks)
  }

  port.onmessage = (e) => {
    if (e.data && e.data.type === 'tasks-generated') {
      latestTasks = e.data.tasks
      // Broadcast to ALL connected ports
      for (const p of ports) {
        if (p !== port) {
          p.postMessage(e.data.tasks)
        }
      }
    }
  }

  port.onclose = () => {
    const idx = ports.indexOf(port)
    if (idx !== -1) ports.splice(idx, 1)
  }
}
