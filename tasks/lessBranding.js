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

  var _findLess = function(brands, base, name){
    var found = [];
    brands.every(function(brand){
      var lessPath = path.join(base, brand, 'main.less');
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


  grunt.registerMultiTask('lessBranding', 'Process branded LESS', function() {
    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    var brands = [];
    var options = this.options({
      base: path.join('src', 'style'),
      searchPrefix: '^app\-module\-'
    });
    if(options.brand) brands.push(options.brand);
    brands.push('');  //run default brand too
    grunt.log.debug('Using brands: ', brands.join("\n  "));
    var searchPrefix = new RegExp(options.searchPrefix);

    var moduleImports = [];

    //only look in our apps shared modules
    var appDependencies = Object.keys(pkg.dependencies).filter(function(dep){
      return searchPrefix.test(dep);
    });

    appDependencies.forEach(function(moduleName){
      var base = path.join('node_modules', moduleName, options.base);
      grunt.log.debug('Searching in:', base);
      moduleImports = moduleImports.concat(_findLess(brands, base, moduleName));
    });

    grunt.log.debug('Adding app specific LESS');
    moduleImports = moduleImports.concat(_findLess(brands, options.base));

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
      var brandFile = options.brand || 'main';
      var out = path.join(options.outputPath, brandFile + '.css');
      grunt.file.write(out, output.css);
      grunt.log.writeln('File "' + out + '" created.');
    },
    function(error){
      grunt.log.error('Error: ', error);
    });

  });

};
