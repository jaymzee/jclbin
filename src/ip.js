"use strict";
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

exports.enumerateIfs = enumerateIfs;
