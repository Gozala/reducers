/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
/*globals ActiveXObject */

'use strict';

// Resources:
// http://www.html5rocks.com/en/tutorials/file/xhr2/

module.exports = (function() {
  if (typeof(ActiveXObject) !== 'undefined') {
    // Taken from: http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
    var option, options = [
      'Msxml2.XMLHTTP.6.0',
      'Msxml2.XMLHTTP.3.0',
      'Microsoft.XMLHTTP'
    ];
    while (options.length) {
      option = options.shift()
      try { new ActiveXObject(option) }
      catch(e) { option = null }
    }

    return function MSXMLHttpRequest() { return new ActiveXObject(option) }
  } else if (typeof(XMLHttpRequest) !== 'undefined') {
    return XMLHttpRequest
  } else {
    throw Error('Ajax is not supported in this browser')
  }
})()
