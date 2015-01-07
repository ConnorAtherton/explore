var fs = require('fs');
var path = require('path');

var noop = function() {};
var fileRegex;
var callbacks;

/* Walks all child directories looking for files to scan starting from
 * a root directory.
 *
 * @param {dir} string - Root dir to start the search from.
 * @param {function} cb - Function to be called once traversing
 *                        is finished.
 */
function explore(filetypes, cbs, dir, cb) {
  cb = cb || noop;
  fileRegex = filetypes ? regexify(filetypes) : (new RegExp(/.*/));

  var remaining = 1;
  var rootDir = process.cwd() + (dir || '');

  if (!Array.isArray(cbs)) callbacks = !cbs ? [] : [cbs];

  (function traverse(dir) {
    fs.readdir(dir, function(err, list) {
      if (err) return cb(err);
      remaining--;

      list.forEach(function(file) {
        remaining++;

        var absPath = path.resolve(dir, file);
        var header = path.relative(rootDir, absPath);

        fs.lstat(absPath, function(err, stat) {
          if (err) return cb(err);

          if (stat) {
            if (stat.isDirectory()) {
              return shouldContinue(file) && !stat.isSymbolicLink() ? traverse(absPath) : --remaining;
            } else {
              if (shouldContinue(file)) call(absPath);

              --remaining;
              if (!remaining) return;
            }
          }
        });
      });
    });
  })(rootDir);
}


function call(filePath) {
  if (!callbacks) return;

  var l = callbacks.length;
  for (var i = 0; i < l; i++) {
    callbacks[i](filePath);
  }
}

/* Checks to see if a file is hidden
 *
 * @param {file} string - Name of the file to check
 * @returns {boolean}
 */
function isHidden(file) {
  return file.substring(0, 1) === '.';
}

/* Returns true if a file should be scanned for todos. Currently no hidden files
 * or directories or files in .gitignore will be counted.
 *
 * @param {string} file
 * @returns {boolean}
 */
function shouldContinue(file) {
  return fileRegex.test(file) && !isHidden(file);
}

/* Returns a new regex from the format strings passed in.
 *
 * @param {string} files
 * @returns {regex}
 */
function regexify(files) {
  var newString = "^(.*\.(" + files + ")$)?[^.]*$"
  return new RegExp(newString);
}

module.exports = explore;
