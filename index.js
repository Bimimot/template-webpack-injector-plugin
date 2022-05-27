const HtmlWebpackPlugin = require("html-webpack-plugin");

function wrapScripts(htmlTemp) {
    let newHtmlTemp = !!htmlTemp ? htmlTemp : "";
    const scriptsArr = htmlTemp.match(/<script.*?>.*?<\/script>/ig);
    let scriptsByKey = {};
    if (!!scriptsArr) {
        scriptsArr.forEach(script => {
            if (script.includes('_partial_')) {
                const scriptKey = script.match(/_partial_[a-z]*/)[0].replace('_partial_', "");
                if (scriptKey === "css") {
                    script = script.replace('defer', '')
                };
                if (scriptKey.length > 0) {
                    scriptsByKey = {
                        ...scriptsByKey,
                        [scriptKey]: !!scriptsByKey[scriptKey] ? scriptsByKey[scriptKey] + script : script
                    };
                    newHtmlTemp = newHtmlTemp.replace(script, '')
                };
            };
        });
    }

    if (Object.keys(scriptsByKey).length > 0) {
        for (let key in scriptsByKey) {
            newHtmlTemp = `{{#partial "${key}"}}\n${scriptsByKey[key]}\n{{/partial}}\n` + newHtmlTemp;
        };
    }
    return newHtmlTemp
}

class HbsBlocksInjectorPlugin {
    apply(compiler) {
        // HtmlWebpackPlugin version 4.0.0-beta.5
        if (HtmlWebpackPlugin.getHooks) {
            compiler.hooks.compilation.tap('HbsBlocksInjectorPlugin', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                    'HbsBlocksInjectorPlugin', (data, callback) => {
                        data.html = wrapScripts(data.html);
                        callback(null, data)
                    }
                )
            });

        } else {
            compiler.hooks.compilation.tap('HbsBlocksInjectorPlugin', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                    'HbsBlocksInjectorPlugin', (data, callback) => {
                        data.html = wrapScripts(data.html);
                    }
                )
            });
        }
    }
}

module.exports = HbsBlocksInjectorPlugin;

//-----------------------readme-----------------
//Plugin make injection of js chunks and wrap scripts in pattern: {{#partial "anyBlock"}}<script></script>{{/partial}} using HtmlWebpackPlugin(with ability to provide async / defer)
//For wrapping chunk in {{#partial "anyBlock"}}..{{}} chunk must have name like: name_partial_anyBlock


//example of config

// module.exports = {
//     entry: {
//         main: "./index.js",
//         testStyle_partial_css: "./someStyle.js", //add '_partial_css
//         test_partial_script: "./someScript.js"   //add '_partial_script
//     },
//     ....
//     plugins: [
//         new HtmlWebpackPlugin({
//             chunks: ["main", "test_partial_script", "testStyle_partial_css"],
//             template: "./someTemplate.hbs",
//             filename: "./src/hbs/someTemplate.hbs"
//         }),
//         new HtmlWebpackInjector()      // Initialize plugin
//     ]
// }

//Example with entry & generated otuput template:

//----Entry template
// <h1>Title</h1>
// <div>Some content</div>
//

//----Output template---

// <h1>Title</h1>
// <div>Some content</div>
//
// <script src="/static/js/project.b28a04b1.chunk.js"></script>
// {{#partial "css" } }
// <script src="testStyle_partial_css.bundle.js"></script>
// {{/partial}}
//
// {{#partial "script" } }
//  <script src="testStyle_partial_script.bundle.js"></script>
// {{/partial}}