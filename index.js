const HtmlWebpackPlugin = require("html-webpack-plugin");

function wrapScripts(htmlTemp) {
    let newHtmlTemp = !!htmlTemp ? htmlTemp : "";
    const scriptsArr = htmlTemp.match(/<script.*?>.*?<\/script>/ig);
    let scriptsByKey = {};
    if (!!scriptsArr) {
        scriptsArr.forEach(script => {
            if (script.includes('_partial_')) {
                const scriptKey = script.match(/_partial_[a-z]*/)[0].replace('_partial_', "");

                if (scriptKey.length > 0) {
                    newHtmlTemp = newHtmlTemp.replace(script, '');

                    //remove defer mode for css blocks
                    if (scriptKey === "css") {
                        script = script.replace('defer', '')
                    };

                    scriptsByKey = {
                        ...scriptsByKey,
                        [scriptKey]: !!scriptsByKey[scriptKey] ? scriptsByKey[scriptKey] + script : script
                    };
                };
            };
        });
    }

    if (Object.keys(scriptsByKey).length > 0) {
        for (let key in scriptsByKey) {
            newHtmlTemp = `{{#partial "${key}"}}\n${scriptsByKey[key]}\n{{/partial}}\n` + newHtmlTemp;
        };
    };

    return newHtmlTemp
}

class TemplateWebpackInjectorPlugin {
    apply(compiler) {
        // HtmlWebpackPlugin version 4.0.0-beta.5
        if (HtmlWebpackPlugin.getHooks) {
            compiler.hooks.compilation.tap('TemplateWebpackInjectorPlugin', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                    'TemplateWebpackInjectorPlugin', (data, callback) => {
                        data.html = wrapScripts(data.html);
                        callback(null, data)
                    }
                )
            });

        } else {
            compiler.hooks.compilation.tap('TemplateWebpackInjectorPlugin', (compilation) => {
                HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                    'TemplateWebpackInjectorPlugin', (data, callback) => {
                        data.html = wrapScripts(data.html);
                    }
                )
            });
        }
    }
}

module.exports = TemplateWebpackInjectorPlugin;