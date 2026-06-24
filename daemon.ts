// Daemon launcher: spawns `next dev` as a fully detached daemon that
// survives the parent shell exiting. Uses detached + unref + shell redirection.
import { spawn } from 'bun';

const child = spawn({
  cmd: ['bash', '-c', 'cd /home/z/my-project && exec /home/z/my-project/node_modules/.bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1'],
  cwd: '/home/z/my-project',
  stdout: 'ignore',
  stderr: 'ignore',
  stdin: 'ignore',
  detached: true,    // new process group + session
  onExit: null,
});

// Write the PID so we can manage it later
await Bun.write('/home/z/my-project/dev.pid', String(child.pid));

// CRITICAL: unref so this launcher can exit while the child keeps running
child.unref();

console.log('Daemon started, PID:', child.pid);
process.exit(0);
