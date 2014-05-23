module.exports = function (grunt) {

  grunt.initConfig({

    paths: {
      dist: 'client/dist/',
      src: 'client/src/',
      scss: 'client/src/assets/scss/',
      stylesheets: 'client/src/assets/stylesheets/'
    },

    watch: {
      sass: {
        files: ['<%= paths.scss %>**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      }
    },

    sass: {
      options: {
        //compass: true,
        precision: 6
      },
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= paths.stylesheets %>application.css': ['<%= paths.scss %>application.scss']
        }
      },
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          '<%= paths.stylesheets %>application.css': ['<%= paths.scss %>application.scss']
        }
      }
    },
    concat: {
        js: {
            src: ['<%= paths.src %>common/_declarations.js', 'client/libs/rx.angular.js', '<%= paths.src %>**/*.js'],
            dest: '<%= paths.dist %>app.js'
        }
    },
    uglify: {
        production: {
            files: {
                '<%= paths.dist %>app.min.js':'<%= paths.dist %>app.js'
            }
        }
    }
  });

  // I think we want to run something like https://github.com/ChrisWren/grunt-nodemon
  // to to restart our node server when files change

  grunt.registerTask('default', ['sass:dist', 'concat', 'uglify']);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');


};
