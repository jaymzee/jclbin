const os = require('os');
const interfaces = getInterfaces();

// return non-local and non-ipv6 interfaces
function getInterfaces() {
  const ifs = os.networkInterfaces();
  const results = {};

  for (const [name, nets] of Object.entries(ifs)) {
      for (const net of nets) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
  }
  return results;
}

function serverUrl(server) {
  let { address, family, port } = server.address()

  // ipv6 address aren't allowed in URLs without brackets
  if (family == 'IPv6' && address.includes(':')) {
    address = `[${address}]`
  }

  // instead of returning 0.0.0.0 or [::], use first
  // interface cached from os.networkInterfaces()
  const ifnames = Object.keys(interfaces);
  if (ifnames.length > 0) {
    address = interfaces[ifnames[0]];
  }

  return `http://${address}:${port}`
}

exports.getInterfaces = getInterfaces;
exports.serverUrl = serverUrl;
