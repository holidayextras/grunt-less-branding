/*
 * grunt-less-module-branding
 *
 *
 * Copyright (c) 2015 Mark Terry
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var less = require('less');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  var _findLess = function(options, base, name){
    var found = [];
    options.brands.every(function(brand){
      var lessPath = path.join(base, 'assets', 'style', brand, 'main.less');
      if(fs.existsSync(lessPath)){
        grunt.log.debug('Found:', lessPath);
        if(name){
          found.push("." + name + " {\n  @import " + '"' + lessPath + '";' + "\n}");
        }
        else{
          found.push("@import " + '"' + lessPath + '";');
        }
        if(brand) return false;
      }
      return true;
    });
    return found;
  };


  grunt.registerMultiTask('less_module_branding', 'Process brand module less', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      brands: []
    });

    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    options.brands.push('');  //run default brand too
    grunt.log.debug('Using brands: ', options.brands.join("\n  "));

    var moduleImports = [];

    Object.keys(pkg.dependencies).forEach(function(moduleName){
      var base = path.join('node_modules', moduleName);
      grunt.log.debug('Searching in:', base);
      moduleImports = moduleImports.concat(_findLess(options, base, moduleName));
    });

    grunt.log.debug('Adding app specific LESS');
    moduleImports = moduleImports.concat(_findLess(options, ''));

    var lessOptions = {
      //FIXME does nothing in render's grunt-contrib-less strictImports: true,
      syncImport: true,
      //TODO customFunctions: helpers.customLessFunc,
      compress: true,
      ieCompat: true
    };

    less.render(moduleImports.join("\n"), lessOptions).then(function(output){
      grunt.log.debug('CSS output:');
      grunt.log.debug(output.css);
      var out = path.join('www', 'main.css');
      grunt.file.write(out, output.css);
      grunt.log.writeln('File "' + out + '" created.');
    },
    function(error){
      grunt.log.error('Error: ', error);
    });

  });

};
