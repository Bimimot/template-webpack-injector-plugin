# HTML-template injector plugin
 Plugin make injection of js chunks and wrap scripts in pattern:
 ```
 {{#partial "key"}}<script>chunk.js</script>{{/partial}} using HtmlWebpackPlugin
 ```
 Works with Webpack 5 and Webpack 4

## Installation
```
 npm i --save-dev template-webpack-injector
```

```
 yarn add -dev template-webpack-injector
```

## How to use
For wrapping chunk in {{#partial "key"}}..{{}} chunk must have name like: name_partial_key

### Webpack config
```
const TemplateWebpackInjectorPlugin = require('template-webpack-injector');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPluginOptions = {
        inject: true,
        cache: isEnvDevelopment, //emit new bundle after changing, hot re-emit
        minify: false           //HTML plugin can't minify hbs & others templates
    };

 module.exports = {
     entry: {
         main: "./index.js",
         main_partial_css: "./main_style.js",     // add to name the mark '_partial_css'
         main_partial_script: "./main_script.js"  //  add to name the mark '_partial_script'
     },
     ....
     plugins: [
        new HtmlWebpackPlugin({
             ...htmlPluginOptions,
             chunks: [],  //no chunks, hust template for hot-watching
             template: "./base.hbs",
             filename: "./hbs/base.hbs"
         }),
         new HtmlWebpackPlugin({
             ...htmlPluginOptions,
             chunks: ["main", "test_partial_script", "testStyle_partial_css"],
             template: "./index.hbs",
             filename: "./hbs/index.hbs"
         }),
         new TemplateWebpackInjectorPlugin()       //Initialize plugin
     ]
 }
```

### Example with entry & generated otuput hbs-templates
---
#### Entry
##### base.hbs
```
<!DOCTYPE html>
<head>
    {{#block "css"}}{{/block}}
    {{#block "js"}}{{/block}}
</head>

<body>
    {{#block "page-content"}}
    No content
    {{/block}}
</body>

</html>
```
##### index.hbs (custom page)
```
{{#partial "page-content"}}
    <div class="custom-page">
    <h1>CUSTOM PAGE</h1>
        //some html or hbs content for custom-page
    </div>
{{/partial}}
{{>base}}
```
---
#### Output templates HBS
##### base.hbs (nothing changed)
```
<!DOCTYPE html>
<head>
    {{#block "css"}}{{/block}}
    {{#block "js"}}{{/block}}
</head>

<body>
    {{#block "page-content"}}
    No content
    {{/block}}
</body>
</html>
```
##### index.hbs
```
 {{#partial "css" }}
  <script src="main_partial_css.bundle.js"></script>
 {{/partial}}

 {{#partial "script" }}
  <script defer src="main_partial_script.bundle.js"></script>
 {{/partial}}

{{#partial "page-content"}}
    <div class="custom-page">
    <h1>CUSTOM PAGE</h1>
        //some html or hbs content for custom-page
    </div>
{{/partial}}
{{>base}}
```
---
### Output html in browser
```
<!DOCTYPE html>
<head>
    <script src="main_partial_css.bundle.js"></script>
    <script defer src="main_partial_script.bundle.js"></script>
</head>

<body>
    <div class="custom-page">
    <h1>CUSTOM PAGE</h1>
        //some html or hbs content for custom-page
    </div>
</body>
</html>
```
---