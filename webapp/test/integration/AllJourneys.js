jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Products in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"demo/com/vn/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"demo/com/vn/test/integration/pages/App",
	"demo/com/vn/test/integration/pages/Browser",
	"demo/com/vn/test/integration/pages/Master",
	"demo/com/vn/test/integration/pages/Detail",
	"demo/com/vn/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "demo.com.vn.view."
	});

	sap.ui.require([
		"demo/com/vn/test/integration/MasterJourney",
		"demo/com/vn/test/integration/NavigationJourney",
		"demo/com/vn/test/integration/NotFoundJourney",
		"demo/com/vn/test/integration/BusyJourney",
		"demo/com/vn/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});