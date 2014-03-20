module.exports = function (grunt) {

    grunt.registerTask('sampleindex', function () {
        var index = {
            files : []
        };

        if (!grunt.file.exists('www/wav')) {
            grunt.file.mkdir('www/wav');
        }


        grunt.file.expand('wav/*').forEach(function (dir) {
            grunt.file.expand(dir + '/*.wav').forEach(function (file) {
                grunt.file.copy(file, 'www/' + file, {
                    encoding : null
                });
                index.files.push({
                    path : file
                });
            });
        });

        grunt.file.write('www/wav/index.json', JSON.stringify(index));
        grunt.log.ok('Copied ' + index.files.length + ' sound files');
    });
};