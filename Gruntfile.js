module.exports = function (grunt) {

  grunt.initConfig({

    paths: {
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
      dev: {
        options: {
          style: 'expanded',
          precision: 6
        },
        files: {
          '<%= paths.styles %>main.css': ['<%= paths.styles %>main.scss']
        }
      },
      dist: {
        options: {
          style: 'compressed',
          precision: 6
        },
        files: {
          '<%= paths.styles %>main.min.css': ['<%= paths.styles %>main.scss']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

};