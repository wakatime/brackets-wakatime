/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var VERSION = '1.0.0';

    var EditorManager      = brackets.getModule("editor/EditorManager"),
        DocumentManager    = brackets.getModule("document/DocumentManager"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        CommandManager     = brackets.getModule("command/CommandManager"),
        Menus              = brackets.getModule("command/Menus"),
        prefs              = PreferencesManager.getExtensionPrefs("WakaTime");

    prefs.definePreference("apikey", "string", "");

    var lastAction         = 0,
        lastFile           = undefined;

    function sendHeartbeat(file, time, project, language, isWrite) {
        $.ajax({
            type: 'POST',
            url: 'https://wakatime.com/api/v1/actions',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                time: time/1000,
                file: file,
                project: project,
                language: language,
                is_write: isWrite ? true : false,
                lines: isWrite ? true : false,
                plugin: 'brackets-wakatime/'+VERSION,
            }),
            headers: {
                'Authorization': 'Basic '+btoa(prefs.get("apikey")),
            },
        });
        lastAction = time;
        lastFile = file;
    }

    function enoughTimePassed() {
        return lastAction + 120000 < Date.now();
    }

    function handleAction(currentDocument, isWrite) {
        if (currentDocument) {
            var file = currentDocument.file;
            if (file && file.isFile) {
                var time = Date.now();
                if (isWrite || enoughTimePassed() || lastFile !== file.fullPath) {
                    var language = currentDocument.language ? currentDocument.language.getName() : undefined;
                    var project = ProjectManager.getProjectRoot() ? ProjectManager.getProjectRoot().name : undefined;
                    sendHeartbeat(file.fullPath, time, project, language, isWrite);
                }
            }
        }
    }

    $(DocumentManager).on('currentDocumentChange', function () {
        handleAction(DocumentManager.getCurrentDocument());
    });

    $(DocumentManager).on('documentSaved', function () {
        handleAction(DocumentManager.getCurrentDocument(), true);
    });

    $(window).on('keypress', function () {
        handleAction(DocumentManager.getCurrentDocument());
    });

    // Function to run when the menu item is clicked
    function promptForApiKey() {
        var apikey = window.prompt("[WakaTime] Enter your wakatime.com api key:", prefs.get("apikey"));
        if (apikey) {
            prefs.set("apikey", apikey);
            prefs.save();
        }
    }

    var COMMAND_ID = "wakatime.apikey";
    CommandManager.register("WakaTime API Key", COMMAND_ID, promptForApiKey);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID);

    if (!prefs.get("apikey")) {
        promptForApiKey();
    }
});
