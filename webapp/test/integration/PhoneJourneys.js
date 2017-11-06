jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"demo/com/vn/test/integration/NavigationJourneyPhone",
		"demo/com/vn/test/integration/NotFoundJourneyPhone",
		"demo/com/vn/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});