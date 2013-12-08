module.exports = function (grunt) {

  grunt.initConfig({

    paths: {
      src: 'client/src/',
      styles: 'client/src/styles/'
    },

    watch: {
      sass: {
        files: ['<%= paths.styles %>**/*.scss'],
        tasks: ['sass:dev'],
        options: {
          livereload: true
        }
      }
    },

    sass: {
      dev: {
        options: {
          style: 'expanded',
          precision: 6
        },
        files: {
          '<%= paths.styles %>main.css': ['<%= paths.styles %>main.scss']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

};