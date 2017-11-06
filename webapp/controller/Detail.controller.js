/*global location */
sap.ui.define([
	"demo/com/vn/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"demo/com/vn/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("demo.com.vn.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			// 			var oTable = this.getView().byId("__item1");
			// 			var scroll = new sap.ui.core.ScrollBar({
			// 				height: "200px",
			// 				width: "200px",
			// 				vertical: true
			// 			});
			// 			scroll.addContent(oTable);
			// var oScrollBar = new sap.ui.core.ScrollBar("__item1", {
			//     vertical: true

			// });
			// 			var items = this.getView().byId("__item1");
			// 			var oScrollBar = new sap.m.ScrollBar({
			// 				height: "100px",
			// 				vertical: true,
			// 				focusable: true,
			// 				content: [items]
			// 			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Products", {
					ID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.ID,
				sObjectName = oObject.Name,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		onOpenViewDialog: function() {
			if (!this._oDialogCRUD) {
				this._oDialogCRUD = sap.ui.xmlfragment("demo.com.vn.view.DialogCRUD", this);
				this.getView().addDependent(this._oDialogCRUD);
				// forward compact/cozy style into Dialog
				this._oDialogCRUD.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oDialogCRUD.open();
		},
		onCloseViewDialog: function() {
			this._oDialogCRUD.close();
		},
		onCreate: function() {
			var oModel = this.getOwnerComponent().getModel();
			//var dialog = this.getView().byId("dialog");
			//var content = dialog.getContent();
			var oEntry = {};
			oEntry.ID = sap.ui.getCore().byId("__inputCRUD0").getValue(); //control with Fragment
			oEntry.Name = sap.ui.getCore().byId("__inputCRUD1").getValue();
			oEntry.Description = sap.ui.getCore().byId("__inputCRUD2").getValue();
			oEntry.ReleaseDate = sap.ui.getCore().byId("__inputCRUD3").getValue();
			oEntry.DiscontinuedDate = sap.ui.getCore().byId("__inputCRUD4").getValue();
			oEntry.Rating = sap.ui.getCore().byId("__inputCRUD5").getValue();
			oEntry.Price = sap.ui.getCore().byId("__inputCRUD6").getValue();

			oModel.create("/Products", oEntry, null, {
				success: function() {
					sap.m.MessageBox.show("Created successfully!", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Information!"
					});
					//oModel.refresh(true);
				},
				error: function() {
					sap.m.MessageBox.show("Error. Failed to create the Product! Please try again later,", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Info!"
					});
				}
			});
			this._oDialogCRUD.close();
			oModel.refresh(true);
		},
		onDelete: function() {
			//This code was generated by the layout editor.
			/*var oTable = this.getView().byId("__table0");
			var iIdx = oTable.getSelectedIndex();
			var sPath = oTable.getContextByIndex(iIdx).getPath();
			var oObj = oTable.getModel().getObject(sPath);*/
			var oTable = this.getView().byId("__table1");
			var oSelectedItems = oTable.getSelectedItems();
			var oModel = this.getOwnerComponent().getModel();
			var value = this.getView().byId("__input4").getValue();
			if (oSelectedItems.length > 0) {
				oModel.remove("/Products(" + value + ")", {
					success: function() {
						sap.m.MessageBox.show("Deleted successfully!", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Information!"
						});
						//oModel.refresh(true);
					},
					error: function() {
						sap.m.MessageBox.show("Oops! Something wrong to Delete.", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Failed!"
						});
					}
				});
				//oModel.refresh(true);
			} else {
				sap.m.MessageBox.show("Please select a row to delete!", {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Note!"
				});
			}
			//oModel.refresh(true);
		},
		onUpdate: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oEntry = {};
			var value = this.getView().byId("__input4").getValue();
			//oEntry.DiscontinuedDate = "/Date(1023698741000)/";
			oEntry.ID = this.getView().byId("__input4").getValue();
			oEntry.Name = this.getView().byId("__input5").getValue();
			oEntry.Description = this.getView().byId("__input6").getValue();
			oEntry.ReleaseDate = this.getView().byId("__input7").getValue();
			oEntry.DiscontinuedDate = this.getView().byId("__input8").getValue();
			oEntry.Rating = this.getView().byId("__input9").getValue();
			oEntry.Price = this.getView().byId("__input10").getValue();
			oModel.update("/Products(" + value + ")", oEntry, {
				success: function() {
					sap.m.MessageBox.show("Updated successfully!", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Info!"
					});
				},
				error: function() {
					sap.m.MessageBox.show("Sorry,Can not Update the Product! Please try again later.", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Oops!"
					});
				}
			});
		},
		OnScrollBar: function() {
			var oTable = this.getView().byId("__table0");
			oTable.setShowVerticalScrollBar(true);
		}

	});

});