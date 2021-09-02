import os from 'os';

// return ipv4 interfaces
function enumerateIfs(nonlocal) {
  const ifs = os.networkInterfaces();
  const results = {};

  for (const [name, nets] of Object.entries(ifs)) {
    for (const net of nets) {
      if (net.family !== 'IPv4' || (nonlocal && net.internal)) {
        /* eslint-disable-next-line no-continue */
        continue;
      }
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
  return results;
}

export default { enumerateIfs };
