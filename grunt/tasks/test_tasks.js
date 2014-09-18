module.exports = function(grunt) {
    grunt.registerTask('test', [
        'jshint:test',
        'jscs:test',
        'copy:devtest',
        'connect:test',
        'jasmine:testlocalserver'
    ]);
};
