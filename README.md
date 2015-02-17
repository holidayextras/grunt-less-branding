# grunt-less-branding

> Process branded less

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-less-branding --save
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-less-branding');
```

## The "lessBranding" task

### Overview
In your project's Gruntfile, add a section named `less_module_branding` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  lessBranding: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.brand
Type: `String`
Default value: `',  '`

A string value that is used to specify the brand to create CSS for.

#### options.base
Type: `String`
Default value: `'src/style'`

A string value that is used to determine where to look for LESS files.

#### options.outputPath
Type: `String`
Default value: `''`

A string value that is used to determine where to write the processed CSS file.

#### options.searchPrefix
Type: `String`
Default value: `'^app\-module\-'`

A string value regular expression that is used to determine which npm dependencies are searched.

#### options.lessOptions
Type: `Object`
Default value:

```js
{
  syncImport: true,
  compress: true,
  ieCompat: true
}
```

An object of options to pass to less, see the [less docs](http://lesscss.org/usage/#command-line-usage-options) for more info.

#### options.featurePatterns
Type: `Array`
Default value:

```js
[
  'src/*',
  '!src/style'
]
```

An array of file path glob patterns, these are used to search for application specific features.

### Usage Examples

```js
grunt.initConfig({
  lessBranding: {
    options: {
      outputPath: 'www'
    },
    brand_a: {
      options: {
        brand: 'brand_a'
      }
    },
    nobrand: {
    }
  }
});
```

