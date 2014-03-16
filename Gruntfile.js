module.exports = function (grunt) {

    grunt.initConfig({
        jshint : {
            all : ['Gruntfile.js', 'js/**/*.js'],
            options : {
                jshintrc : true
            }
        },
        // concat : {
        //     dist : {
        //         src : ['js/main.js'],
        //         dest : 'www/js/main.js'
        //     }
        // },
        uglify : {
            dist : {
                files : {
                    'www/js/main.js' : ['js/main.js']
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
                files : ['www/**/*.css'],
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

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.registerTask('serve', ['default', 'connect:server', 'watch']);
};