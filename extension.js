const vscode = require('vscode');

/**
 * Show input box, return result
 * @param {vscode.window} window
 */
async function showInputBox(window) {
    var result = await window.showInputBox({
        placeHolder: 'Search term (regular expression)'
    });
    return result;
}

/**
 * Function to get lines matching the search term in the editor
 * @param {vscode.TextEditor} editor
 *   A text editor, should be the currently active one
 * @param {String} searchTerm
 *   A regular expression
 * @returns {Array}
 *   Array containing a list of ranges of the matching lines (item 0) and the text of them (item 1)
 * @todo Optionally offer plain string matching
 */
function getMatchingLines(editor, searchTerm) {
    var currentLine;
    var lineContent;
    var listOfRanges = [];
    var text = '';
    // The end of line most commonly used in the document
    const endOfLine = editor.document.eol;
    // iterate though the lines in the document
    for (let index = 0; index < editor.document.lineCount; index++) {
        // Get the current line
        currentLine = editor.document.lineAt(index);
        // Get the text of the current line
        lineContent = currentLine.text
        // If the regex provided in searchTerm matches part of the line
        if (lineContent.search(searchTerm) != -1) {
            // Append correct end of line char to the line and append to the text string
            if (endOfLine === vscode.EndOfLine.CRLF) {
                text += currentLine.text + "\r\n";
            }
            else if (endOfLine === vscode.EndOfLine.LF) {
                text += currentLine.text + "\n";
            }
            // Append the result to the list of ranges
            listOfRanges.push(currentLine.rangeIncludingLineBreak)
        }
    }
    return [listOfRanges, text];
}

/**
 * Function called on activation of the extension.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Command to delete lines
    let deleteLinesCommand = vscode.commands.registerTextEditorCommand('extension.deleteLines', function () {
        const window = vscode.window;
        // Show input box
        var result = showInputBox(window)
        var editor = vscode.window.activeTextEditor;
        // Assign call back to the showInputBox function
        result.then(searchTerm => {
            // If search term is not blank
            if (searchTerm != '') {
                var lines = getMatchingLines(editor, searchTerm)
                // If there were some matches
                if (lines[0] != '') {
                    // Delete all the lines from the dicument
                    editor.edit(function (builder) {
                        for (let index = 0; index < lines[0].length; index++) {
                            builder.delete(lines[0][index]);
                        }
                    })
                    // Notify user
                    window.showInformationMessage(String(lines[0].length) + ' lines were deleted')
                }
                else {
                    window.showInformationMessage('No match found')
                }
            }
        })
    });

    let cutLinesCommand = vscode.commands.registerTextEditorCommand('extension.cutLines', function () {
        const window = vscode.window;
        var result = showInputBox(window)
        var editor = vscode.window.activeTextEditor;
        result.then(searchTerm => {
            if (searchTerm != '') {
                var lines = getMatchingLines(editor, searchTerm)
                if (lines[0] != '') {
                    // Write text to clipboard
                    vscode.env.clipboard.writeText(String(lines[1]))
                    // Also delete lines
                    editor.edit(function (builder) {
                        for (let index = 0; index < lines[0].length; index++) {
                            builder.delete(lines[0][index]);
                        }
                    })
                    window.showInformationMessage(String(lines[0].length) + ' lines were cut')
                }
                else {
                    window.showInformationMessage('No match found')
                }
            }
        })
    });

    let copyLinesCommand = vscode.commands.registerTextEditorCommand('extension.copyLines', function () {
        const window = vscode.window;
        var result = showInputBox(window)
        var editor = vscode.window.activeTextEditor;
        result.then(searchTerm => {
            if (searchTerm != '') {
                var lines = getMatchingLines(editor, searchTerm)
                if (lines[0] != '') {
                    // Copy the lines
                    vscode.env.clipboard.writeText(String(lines[1]))
                    window.showInformationMessage(String(lines[0].length) + ' lines were copied')
                }
                else {
                    window.showInformationMessage('No match found')
                }
            }
        })
    });

    context.subscriptions.push(deleteLinesCommand);
    context.subscriptions.push(copyLinesCommand);
    context.subscriptions.push(cutLinesCommand);

}
exports.activate = activate;

function deactivate() {}

module.exports = {
    activate,
    deactivate
}