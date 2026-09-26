/**
 * Windows Build Fix for Next.js 15
 * 
 * Patches fs.readlink, fs.readlinkSync, and fs.promises.readlink to work around EISDIR errors
 * with directory snapshots on Windows.
 * See: https://github.com/vercel/next.js/issues/71054
 */

const fs = require('fs');
const path = require('path');

const originalReadlinkSync = fs.readlinkSync;
const originalReadlink = fs.readlink;
const originalPromisesReadlink = fs.promises ? fs.promises.readlink : null;

fs.readlinkSync = function(targetPath, options) {
  try {
    return originalReadlinkSync(targetPath, options);
  } catch (err) {
    if (err.code === 'EISDIR' || err.code === 'EINVAL') {
      return targetPath;
    }
    throw err;
  }
};

fs.readlink = function(targetPath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  return originalReadlink(targetPath, options, (err, linkString) => {
    if (err && (err.code === 'EISDIR' || err.code === 'EINVAL')) {
      return callback(null, targetPath);
    }
    return callback(err, linkString);
  });
};

if (fs.promises && fs.promises.readlink) {
  fs.promises.readlink = async function(targetPath, options) {
    try {
      return await originalPromisesReadlink(targetPath, options);
    } catch (err) {
      if (err.code === 'EISDIR' || err.code === 'EINVAL') {
        return targetPath;
      }
      throw err;
    }
  };
}

// Find and run the Next.js CLI from the local project
const nextBinPath = path.resolve(__dirname, '../node_modules/.bin/next');
process.argv = ['node', nextBinPath, ...process.argv.slice(2)];
require(path.resolve(__dirname, '../node_modules/next/dist/bin/next'));
