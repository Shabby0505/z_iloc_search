/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comilocsearch/z_iloc_search/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
