module.exports = function (grunt) {

    grunt.initConfig({
        jshint : {
            all : ['Gruntfile.js', 'js/**/*.js'],
            options : {
                jshintrc : true,
                reporter : require('jshint-stylish')
            }
        },
        uglify : {
            options : {
                compress : false
            },
            dist : {
                options : {
                    compress : false
                },
                files : {
                    'www/js/main.js' : [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                        'bower_components/async/lib/async.js',
                        'js/resources.js',
                        'js/sequencer.js',
                        'js/main.js'
                    ]
                }
            }
        },
        cssmin : {
            dist : {
                files : {
                    'www/css/main.css' : [
                        'bower_components/bootstrap/dist/css/bootstrap.css',
                        'bower_components/bootstrap/dist/css/bootstrap-theme.css',
                        'css/main.css'
                    ]
                }
            }
        },
        watch : {
            options : {
                livereload : true
            },
            html : {
                files : ['www/**/*.html'],
            },
            css : {
                files : ['css/**/*.css'],
                tasks : ['cssmin']
            },
            gruntfile : {
                files : ['Gruntfile.js'],
                tasks : ['jshint']
            },
            scripts : {
                files : ['js/**/*.js'],
                tasks : ['jshint', 'uglify']
            }
        },
        connect : {
            server : {
                options : {
                    port : 8000,
                    base : 'www',
                    livereload : true
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'sampleindex']);
    grunt.registerTask('serve', ['default', 'connect:server', 'watch']);
};