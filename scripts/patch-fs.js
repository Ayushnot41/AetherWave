/**
 * Global fs patch for Windows exFAT drives
 * 
 * On Windows exFAT filesystems, fs.readlink / fs.readlinkSync throws:
 * EISDIR: illegal operation on a directory, readlink '<path>'
 * on regular non-symlink files because exFAT does not support reparse points.
 * 
 * Webpack, enhanced-resolve, and Next.js trace plugins specifically catch
 * EINVAL, ENOENT, or UNKNOWN to signify that a path is a normal file, not a symlink.
 * When EISDIR is received, they re-throw and fail the build.
 * 
 * This patch normalizes EISDIR into EINVAL on Windows, allowing Webpack and Next.js
 * to accurately identify non-symlink files and build cleanly on exFAT drives.
 */
const fs = require('fs');

function normalizeError(err) {
  if (err && (err.code === 'EISDIR' || err.code === 'EPERM')) {
    err.code = 'EINVAL';
  }
  return err;
}

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function(targetPath, options) {
  try {
    return origReadlinkSync(targetPath, options);
  } catch (err) {
    throw normalizeError(err);
  }
};

const origReadlink = fs.readlink;
fs.readlink = function(targetPath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  return origReadlink(targetPath, options, (err, linkString) => {
    callback(normalizeError(err), linkString);
  });
};

if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function(targetPath, options) {
    try {
      return await origPromisesReadlink(targetPath, options);
    } catch (err) {
      throw normalizeError(err);
    }
  };
}
