const vscode = require('vscode');
const utils = require('./utils');


/**
 * Function called on activation of the extension.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Command to delete lines
    let deleteLinesCommand = vscode.commands.registerTextEditorCommand('extension.deleteLines', function () {
        utils.commandsImplementation(context, 'deleted', "Delete Lines Matching Regex Pattern", false)
    });

    let cutLinesCommand = vscode.commands.registerTextEditorCommand('extension.cutLines', function () {
        utils.commandsImplementation(context, 'cut', "Cut Lines Matching Regex Pattern", false)
    });

    let copyLinesCommand = vscode.commands.registerTextEditorCommand('extension.copyLines', function () {
        utils.commandsImplementation(context, 'copied', "Copy Lines Matching Regex Pattern", false);
    });

    let cutToNewDocCommand = vscode.commands.registerTextEditorCommand('extension.cutToNewDocCommand', function () {
        utils.commandsImplementation(context, 'cut', "Cut Lines Matching Regex Pattern and Paste Into New Document", true);
    });

    let copyToNewDocCommand = vscode.commands.registerTextEditorCommand('extension.copyToNewDocCommand', function () {
        utils.commandsImplementation(context, 'copied', "Copy Lines Matching Regex Pattern and Paste Into New Document", true);
    });

    context.subscriptions.push(deleteLinesCommand);
    context.subscriptions.push(copyLinesCommand);
    context.subscriptions.push(cutLinesCommand);
    context.subscriptions.push(cutToNewDocCommand);
    context.subscriptions.push(copyToNewDocCommand);
}

exports.activate = activate;

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
