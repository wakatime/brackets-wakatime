/* ==========================================================
WakaTime
Description: Analytics for programmers.
Maintainer:  WakaTime <support@wakatime.com>
License:     BSD, see LICENSE for more details.
Website:     https://wakatime.com/
===========================================================*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var VERSION = '1.0.4';

    var MainViewManager    = brackets.getModule("view/MainViewManager"),
        DocumentManager    = brackets.getModule("document/DocumentManager"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        CommandManager     = brackets.getModule("command/CommandManager"),
        Menus              = brackets.getModule("command/Menus"),
        prefs              = PreferencesManager.getExtensionPrefs("WakaTime");

    var lastAction         = 0,
        lastFile           = undefined;

    function init() {

        setupPreferences();

        addMenuItem();

        // prompt for api key if not already set
        if (!prefs.get("apikey")) {
            promptForApiKey();
        }

        setupEventListeners();

    }

    function addMenuItem() {

        // register menu command
        var COMMAND_ID = "wakatime.apikey";
        CommandManager.register("WakaTime API Key", COMMAND_ID, promptForApiKey);

        // add menu item
        var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
        menu.addMenuDivider();
        menu.addMenuItem(COMMAND_ID);

    }

    function setupEventListeners() {
        $(MainViewManager).on('currentFileChange', function () {
            handleAction();
        });
        $(DocumentManager).on('documentSaved', function () {
            handleAction(true);
        });
        $(window).on('keypress', function () {
            handleAction();
        });

    }

    function setupPreferences() {
        prefs.definePreference("apikey", "string", "");
        prefs.definePreference("ignore", "array", ["^/var/", "^/tmp/", "^/private/"]);
        if (prefs.getPreferenceLocation('ignore').scope == 'default') {
            prefs.set('ignore', prefs.get('ignore'));
            prefs.save();
        }
    }

    function sendHeartbeat(file, time, project, language, isWrite, lines) {
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
                lines: lines,
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

    function fileIsIgnored(file) {
        var patterns = prefs.get("ignore");
        var ignore = false;
        for (var i=0; i<patterns.length; i++) {
            var re = new RegExp(patterns[i], "gi");
            if (re.test(file)) {
                ignore = true;
                break;
            }
        }
        return ignore;
    }

    function handleAction(isWrite) {
        var currentDocument = DocumentManager.getCurrentDocument();
        if (currentDocument) {
            var file = currentDocument.file;
            if (file && file.isFile) {
                var time = Date.now();
                if (isWrite || enoughTimePassed() || lastFile !== file.fullPath) {
                    if (!fileIsIgnored(file.fullPath)) {
                        var language = currentDocument.language ? currentDocument.language.getName() : undefined;
                        var project = ProjectManager.getProjectRoot() ? ProjectManager.getProjectRoot().name : undefined;
                        var editor = currentDocument._masterEditor;
                        var lines = editor ? editor.lineCount() : undefined;
                        sendHeartbeat(file.fullPath, time, project, language, isWrite, lines);
                    }
                }
            }
        }
    }

    // Function to run when the menu item is clicked
    function promptForApiKey() {
        var apikey = window.prompt("[WakaTime] Enter your wakatime.com api key:", prefs.get("apikey"));
        if (apikey) {
            prefs.set("apikey", apikey);
            prefs.save();
        }
    }

    init();

});
