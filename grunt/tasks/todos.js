'use strict';

var _ = require("underscore");
var path = require("path");

var sys = require('sys');
var exec = require('child_process').exec;

function trim(string) {
    return String(string).replace(/^\s+|\s+$/g, '');
}

module.exports = function(grunt) {
    grunt.registerMultiTask('todos',
        'List all the outstanding todos in your files',
        function todos() {

            var done = this.async();
            var filesRemaining = 0;
            var someFileHasError = false;
            var wroteFilename;

            var filename;

            function taskDone() {
                return filesRemaining === 0;
            }

            grunt.log.writeln("Scanning for TODO's");

            grunt.log.debug("target: " + this.target);
            grunt.log.debug("data: " + JSON.stringify(this.data));
            grunt.log.debug("files: " + JSON.stringify(this.files, null, 2));

            _.each(this.files, function(fileset) {

                var files = fileset['src'];
                _.each(files, function(filepath) {

                    filename = path.basename(filepath);
                    wroteFilename = false;
                    if (!grunt.file.isFile(filepath)) {
                        return;
                    }

                    // queue file
                    filesRemaining++;

                    _.each(grunt.file.read(filepath).split("\n"), function(line, lineNum) {
                        var match = line.match(/(@|_)?TODO.*$/);
                        var blameCmd;
                        if (match) {
                            line = match[0];

                            if (!wroteFilename) {
                                grunt.log.writeln('');
                                grunt.log.writeln(filepath);
                                wroteFilename = true;
                            }

                            var clean = line.replace(new RegExp("\/\/|\/\\*|\\*\/|<!--|-->", "g"), "");

                            if (line.match(/\(\w+\)/)) {
                                grunt.log.writeln("  line " + lineNum + ": " + trim(clean));
                            } else if (line.match(/TODO(\:?)\s*$/)) {
                                someFileHasError = true;

                                // queue "extra file" for async task
                                filesRemaining++;

                                /* jshint -W044 */
                                blameCmd = 'git blame -L' + lineNum + ',+1 ' + filepath + ' | grep -o "\(.*\)"';
                                /* jshint +W044 */

                                exec(blameCmd, function(error, stdout, stderr) {
                                    grunt.log.writeln('');
                                    grunt.log.error('ERROR: has no description');
                                    grunt.log.error(filepath);
                                    grunt.log.error('  ' + lineNum + ': ' + trim(clean));
                                    grunt.log.error(stdout);

                                    filesRemaining--;

                                    if (taskDone() && someFileHasError) {
                                        done(false);
                                    } else if (taskDone()) {
                                        done();
                                    }
                                });
                            } else {
                                someFileHasError = true;

                                // queue "extra file" for async task
                                filesRemaining++;

                                /* jshint -W044 */
                                blameCmd = 'git blame -L' + lineNum + ',+1 ' + filepath + ' | grep -o "\(.*\)"';
                                /* jshint +W044 */

                                exec(blameCmd, function(error, stdout, stderr) {
                                    grunt.log.writeln('');
                                    grunt.log.error('ERROR: needs an owner\'s name');
                                    grunt.log.error(filepath);
                                    grunt.log.error('  ' + lineNum + ': ' + trim(clean));
                                    grunt.log.error(stdout);

                                    filesRemaining--;

                                    if (taskDone() && someFileHasError) {
                                        done(false);
                                    } else if (taskDone()) {
                                        done();
                                    }
                                });
                            }
                        }
                    });

                    filesRemaining--;
                });
            });

            if (taskDone() && someFileHasError) {
                done(false);
            } else if (taskDone()) {
                done();
            }
        });
};

