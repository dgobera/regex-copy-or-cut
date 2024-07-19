const vscode = require('vscode');

/**
 * Show input box, return result
 * @param {vscode.window} window
 */
async function showInputRegexBox(window, title) {
    let caseSensitive = false;

    const inputBox = vscode.window.createInputBox();
    inputBox.placeholder = 'Search term (regular expression)';
    inputBox.title = title;
    let updatePrompt = () => {
        inputBox.prompt = caseSensitive ? "Match case" : "Ignore case";
    }

    inputBox.buttons = [
        {
            iconPath: new vscode.ThemeIcon('case-sensitive'),
            tooltip: 'Toggle Case Sensitivity'
        }
    ];

    inputBox.onDidTriggerButton(() => {
        caseSensitive = !caseSensitive;
        updatePrompt();
    });

    updatePrompt();

    return new Promise((resolve) => {
        inputBox.onDidAccept(() => {
            resolve({ searchTerm: inputBox.value, caseSensitive });
            inputBox.dispose();
        });

        inputBox.onDidHide(() => {
            resolve(null);
            inputBox.dispose();
        });

        inputBox.show();
    });   
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
function getMatchingLines(editor, searchTerm, caseSensitive) {
    var currentLine;
    var lineContent;
    var listOfRanges = [];
    var text = '';
    const searchRegex = new RegExp(searchTerm, caseSensitive ? '' : 'i');

    // The end of line most commonly used in the document
    const endOfLine = editor.document.eol;
    try {
        // iterate though the lines in the document
        for (let index = 0; index < editor.document.lineCount; index++) {
            // Get the current line
            currentLine = editor.document.lineAt(index);
            // Get the text of the current line
            lineContent = currentLine.text
    
            // If the regex provided in searchTerm matches part of the line
            if (searchRegex.test(lineContent)) {
    
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
    }
    catch (e) {
        vscode.window.showErrorMessage('Unable to complete action due to unexpected error ' + e);
    }
    return [listOfRanges, text];
}

/**
 * The function that deletes, copies and cuts based on the output of the other functions
 * @param {String} mode The mode to work in - copy, cut or delete
 * @param {boolean} shouldOpenNewTab Whether we should open a new tab and paste the text into it
 */
function commandsImplementation(mode, title, shouldOpenNewTab) {
    const window = vscode.window;
    
    // Action to be taken when box is submitted
    showInputRegexBox(window, title).then(result => {
        
        if (!result) {
            // if null, the user cancelled
            return;
        }

        try {
            const editor = vscode.window.activeTextEditor;
            const { searchTerm, caseSensitive } = result;

            // Ensuring search term is not invalid
            if (searchTerm != '' && searchTerm != undefined) {
                // Get matching lines
                var lines = getMatchingLines(editor, searchTerm, caseSensitive)
                // If there are matching lines
                if (lines[0] != '') {
                    if (mode == "cut" || mode == "copied") {
                        // Write text to clipboard
                        vscode.env.clipboard.writeText(String(lines[1]))
                    }

                    // Delete lines
                    if (mode == "cut" || mode == "deleted") {
                        editor.edit(function (builder) {
                            for (let index = 0; index < lines[0].length; index++) {
                                builder.delete(lines[0][index]);
                            }
                        })
                    }
                    if (shouldOpenNewTab == true) {
                        openDocWithClipboardText();
                    }
                    
                    // Inform user of success
                    window.showInformationMessage(String(lines[0].length) + ' lines were ' + mode);
                }
                else {
                    window.showInformationMessage('No match found');
                }
            }
            else {
                window.showErrorMessage('Empty search term');
            }
        }
        catch (e) {
            window.showErrorMessage('Unable to complete action due to unexpected error ' + e);
        }
    })
}

/**
 * Open new document with clipboard text pasted into it
 */
function openDocWithClipboardText() {
    try {
        // Set the title of the new document to Untitled
        var setting = vscode.Uri.parse("untitled:Untitled - " + new Date().toTimeString().split(' ')[0] + ' ' + new Date().toDateString());
        // Read clipboard text
        var clipboardText = vscode.env.clipboard.readText()
        // Register call back to paste into new doc
        clipboardText.then(text => {
            vscode.workspace.openTextDocument(setting).then((a) => {
                vscode.window.showTextDocument(a, 1, false).then(e => {
                    e.edit(edit => {
                        edit.insert(new vscode.Position(0, 0), text)
                    });
                });
            });
        });
    }
    catch (e) {
        vscode.window.showErrorMessage('Unable to complete action due to unexpected error ' + e);
    }
}

module.exports = {
    openDocWithClipboardText,
    commandsImplementation,
    getMatchingLines,
}