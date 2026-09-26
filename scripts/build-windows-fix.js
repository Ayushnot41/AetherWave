/**
 * Windows Build Fix for Next.js 15
 * 
 * Patches fs.readlinkSync to work around EISDIR errors
 * with dynamic route directories containing square brackets.
 * See: https://github.com/vercel/next.js/issues/71054
 */

const fs = require('fs');
const path = require('path');
const originalReadlinkSync = fs.readlinkSync;

fs.readlinkSync = function(targetPath, options) {
  try {
    return originalReadlinkSync(targetPath, options);
  } catch (err) {
    // EISDIR: path is a directory, not a symlink - return it as-is
    // EINVAL: invalid operation for this path type - return it as-is
    if (err.code === 'EISDIR' || err.code === 'EINVAL') {
      return targetPath;
    }
    throw err;
  }
};

// Find and run the Next.js CLI from the local project
const nextBinPath = path.resolve(__dirname, '../node_modules/.bin/next');
process.argv = ['node', nextBinPath, ...process.argv.slice(2)];
require(path.resolve(__dirname, '../node_modules/next/dist/bin/next'));
