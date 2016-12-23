History
-------


1.0.8 (2016-12-23)
++++++++++++++++++

- Use modal instead of prompt to be compatible with Brackets-electron. #4


1.0.7 (2015-09-03)
++++++++++++++++++

- Remove /var from default ignored paths preference.


1.0.6 (2015-09-02)
++++++++++++++++++

- Fix typo.


1.0.5 (2015-09-02)
++++++++++++++++++

- Directly bind to events from Brackets modules instead of using jQuery.on/off.


1.0.4 (2015-01-04)
++++++++++++++++++

- Replace depreciated DocumentManager.currentDocumentChange event with
  MainViewManager.currentFileChange.


1.0.3 (2014-08-29)
++++++++++++++++++

- Get total number of lines more efficiently.


1.0.2 (2014-08-27)
++++++++++++++++++

- Log total number of lines in files.


1.0.1 (2014-08-19)
++++++++++++++++++

- Add preference "ignore" which is an array of regex where any file paths
  matching a regex will not be logged.


1.0.0 (2014-08-18)
++++++++++++++++++

- Birth.
