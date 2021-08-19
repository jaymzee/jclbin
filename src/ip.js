const os = require('os');
const interfaces = enumerateIfs(true);

// return ipv4 interfaces
function enumerateIfs(nonlocal) {
  const ifs = os.networkInterfaces();
  const results = {};

  for (const [name, nets] of Object.entries(ifs)) {
    for (const net of nets) {
      if (net.family !== 'IPv4' || nonlocal && net.internal) {
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

function serverUrl(server, protocol, nonlocal) {
  let { address, family, port } = server.address();

  // ipv6 address aren't allowed in URLs without brackets
  if (family == 'IPv6' && address.includes(':')) {
    address = `[${address}]`;
  }

  if (nonlocal) {
    // instead of returning 0.0.0.0 or [::], use the first
    // interface cached from os.networkInterfaces()
    const ifnames = Object.keys(interfaces);
    if (ifnames.length > 0) {
      address = interfaces[ifnames[0]];
    }
  } else {
    // at a bare minimum make sure IPv6 addresses are escaped
    // with square brackets if they contain colons.
    if (family == 'IPv6' && address.includes(':')) {
      address = `[${address}]`;
    }
  }

  return `${protocol}://${address}:${port}`;
}

exports.enumerateIfs = enumerateIfs;
exports.serverUrl = serverUrl;
