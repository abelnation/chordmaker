module.exports = function(grunt) {

    var _ = require("underscore");
    var pkg = grunt.file.readJSON('package.json');

    return function getBanner() {
        var banner = [
            '//     <%= pkg.name %>.js <%= pkg.version %>',
            '//     <%= pkg.homepage %>',
            '//     <%= grunt.template.today("yyyy-mm-dd") %>',
            '//',
            '//     Contributors:',
        ];

        // add contributors
        _.each(pkg.contributors, function(contributor) {
            var contrib_str = _.template("//     <%= name %> (<%= username %>)")(contributor);
            banner.push(contrib_str);
        });

        banner.push('');
        banner.push('');

        banner = banner.join("\n");

        return banner;
    };

};
