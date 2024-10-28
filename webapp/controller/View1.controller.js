sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    'sap/ui/model/type/String',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/m/Token',
],
    function (Controller, Fragment, TypeString, Filter, FilterOperator, JSONModel, MessageToast, Token) {
        "use strict";

        return Controller.extend("com.iloc.search.zilocsearch.controller.View1", {
            onInit: function (oEvent) {
             
                // -------------Start of  MultiInput Object ----------------------
                var oList = this.byId("idSerNoTable");
                this._ILOCMultiInput = this.byId("idIloc");
                this._plantMultiInput = this.byId("idPlant");
                this._name1MultiInput = this.byId("idName1");
                this._name2MultiInput = this.byId("idName2");
                this._name3MultiInput = this.byId("idName3");
                this._name4MultiInput = this.byId("idName4");
                this._streetMultiInput = this.byId("idStreet");
                this._cityMultiInput = this.byId("idCity");
                this._stateMultiInput = this.byId("idState");
                this._zipCodeMultiInput = this.byId("idZipCode");
                this._countryMultiInput = this.byId("idCountry");
                this.getView().setModel(this.StateModel1, "StateModel1");
               
                var  title = this.getResourceBundle().getText("iLocDetails", [0]);
                
                var fCountry = new Filter("Country", "EQ", "US");
                // ---------------- End of MultiInput Object ------------------------------
                //  this.oModel.setSizeLimit(1000);
                var that = this;
               
              // this.getView().byId("idTableHeader").setText(title);
                this._oList = oList;
              
                this.oModel = new JSONModel({
                    isFilterBarVisible: false,
                    filterBarLabel: "",
                   
                    delay: 0,
                    sortBy: "None",
                    groupBy: "None"
                });
              
                that.getOwnerComponent().getModel("StateModel").read("/StateSet", {
                    filters: [fCountry],
                    success: function (res) {
                        sap.ui.core.BusyIndicator.hide();
                        // this.oModel.setProperty("/StateData", res.results);
                        this.StateModel1 = new JSONModel();
                        this.StateModel1.setData(res.results);
                        this.getView().setModel(this.StateModel1, "StateModel1");
                        if (res.results.length === 0) {
                            sap.m.MessageToast.show("No records found for this selection criteria.!");
                        }

                    }.bind(this),
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("No Data Found.!");
                        // sap.m.MessageToast.show(error);
                        this.StateModel1.setData({});
                    }
                });
            },

            onClickState: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this._stateMultiInput = oEvent.getSource().getId();
                // create value help dialog
                if (!this.oState) {
                    this.oState = Fragment.load({
                        id: oView.getId(),
                        name: "com.iloc.search.zilocsearch.fragment.stateDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }

                this.oState.then(function (oValueHelpDialog) {
                    // create a filter for the binding
                    oValueHelpDialog.getBinding("items").filter([new Filter(
                        "Region",
                        FilterOperator.Contains,
                        sInputValue
                    )]);
                    // open value help dialog filtered by the input value
                    oValueHelpDialog.open(sInputValue);
                });
            },

            _handleValueHelConfirm: function (evt) {
                //    var aSelectedItems = evt.getParameter("selectedItems");
                var aSelectedItems = evt.getParameters("tokens").selectedContexts;
                var alength = aSelectedItems.length;
                //  oMultiInput1 = this.byId("idOrderTypeVH");
                // this.oMultiInput1 = evt.getSource().getId();
                this.getView().byId("mySelectDialog").setRememberSelections(true);
                this.byId(this._stateMultiInput).removeAllTokens();
                for (var i = 0; i < alength; i++) {
                    var sPath = parseInt(aSelectedItems[i].sPath.split("/")[1]);
                    for (var j = 0; j < this.StateModel1.oData.length; j++) {
                        if (sPath === j) {
                            this.byId(this._stateMultiInput).addToken(new Token({
                                text: this.StateModel1.oData[sPath].Region
                                //  text :aSelectedItems[0].mProperties.title

                            }));
                        }
                    }
                }


            },

            _handleValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                // var oFilter = new Filter(
                //     "Region",
                //     FilterOperator.Contains,
                //     sValue
                // );


                var oFilter =  new sap.ui.model.Filter({
                    filters: [
                    new sap.ui.model.Filter("Region",FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("RegionDescription",FilterOperator.Contains ,sValue)
                    ],
                    and: false
                })
                evt.getSource().getBinding("items").filter([oFilter]);
            },


            onDialogClose: function (evt) {
                var aSelectedItems = evt.getParameter("selectedItems"),
                    oMultiInput1 = this.byId("idOrderTypeVH");

                if (aSelectedItems && aSelectedItems.length > 0) {
                    aSelectedItems.forEach(function (oItem) {
                        oMultiInput1.addToken(new Token({
                            text: oItem.getTitle()
                        }));
                    });
                }
            },

            // -----------------------------Starte of Logic for ILOC Filter -------------------------


            onClickIlLoc: function () {

                this.oILoc = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.ILOCVH", this);
                this.getView().addDependent(this.oILoc);
                this.oILoc.setRangeKeyFields([{
                    label: "ILOC",
                    key: "iloc",

                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oILoc.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oILoc.setTokens(this._ILOCMultiInput.getTokens());
                this.oILoc.open();


            },

            onILOCVHOkPress: function (oEvent) {
            
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._ILOCMultiInput.setTokens(aTokens);
                this.oILoc.close();
            },
            onILOCVHCancelPress: function (oEvent) {
                this.oILoc.close();
            },
            onILOCVHAfterClose: function (oEvent) {
                this.oILoc.destroy();
            },

            // -----------------------------End of Logic for ILOC Filter ------------------------------


            // -----------------------------Start of Logic for PLant Filter -------------------------


            onClickPlant: function () {


                this.oPlant = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.PLANTVH", this);
                this.getView().addDependent(this.oPlant);
                this.oPlant.setRangeKeyFields([{
                    label: "c",
                    key: "iloc",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oPlant.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);

                this.oPlant.setTokens(this._plantMultiInput.getTokens());
                this.oPlant.open();


            },

            onPlantVHOkPress: function (oEvent) {
             
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._plantMultiInput.setTokens(aTokens);
                this.oPlant.close();
            },
            onPlantVHCancelPress: function (oEvent) {
                this.oPlant.close();
            },
            onPlantVHAfterClose: function (oEvent) {
                this.oPlant.destroy();
            },

            // -----------------------------End of Logic for Plant Filter ------------------------------


            // -----------------------------Start of Logic for Name1 Filter -------------------------


            onClickName1: function () {


                this.oName1 = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.name1VH", this);
                this.getView().addDependent(this.oName1);
                this.oName1.setRangeKeyFields([{
                    label: "ILOC",
                    key: "iloc",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oName1.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oName1.setTokens(this._name1MultiInput.getTokens());
                this.oName1.open();


            },

            onName1VHOkPress: function (oEvent) {
              
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._name1MultiInput.setTokens(aTokens);
                this.oName1.close();
            },
            onName1VHCancelPress: function (oEvent) {
                this.oName1.close();
            },
            onName1VHAfterClose: function (oEvent) {
                this.oName1.destroy();
            },

            // -----------------------------End of Logic for Name1 Filter ------------------------------


            // -----------------------------Start of Logic for Name2 Filter -------------------------


            onClickName2: function () {


                this.oName2 = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.name2VH", this);
                this.getView().addDependent(this.oName2);
                this.oName2.setRangeKeyFields([{
                    label: "Name2",
                    key: "Name2",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oName2.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oName2.setTokens(this._name2MultiInput.getTokens());
                this.oName2.open();


            },

            onName2VHOkPress: function (oEvent) {
              
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._name2MultiInput.setTokens(aTokens);
                this.oName2.close();
            },
            onName2VHCancelPress: function (oEvent) {
                this.oName2.close();
            },
            onName2VHAfterClose: function (oEvent) {
                this.oName2.destroy();
            },

            // -----------------------------End of Logic for Name2 Filter ------------------------------


            // -----------------------------Start of Logic for Name3 Filter -------------------------


            onClickName3: function () {


                this.oName3 = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.name3VH", this);
                this.getView().addDependent(this.oName3);
                this.oName3.setRangeKeyFields([{
                    label: "Name2",
                    key: "Name2",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oName3.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oName3.setTokens(this._name3MultiInput.getTokens());
                this.oName3.open();


            },

            onName3VHOkPress: function (oEvent) {
              
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._name3MultiInput.setTokens(aTokens);
                this.oName3.close();
            },
            onName3VHCancelPress: function (oEvent) {
                this.oName3.close();
            },
            onName3VHAfterClose: function (oEvent) {
                this.oName3.destroy();
            },

            // -----------------------------End of Logic for Name3 Filter ------------------------------


            // -----------------------------Start of Logic for Name4 Filter -------------------------


            onClickName4: function () {


                this.oName4 = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.name4VH", this);
                this.getView().addDependent(this.oName4);
                this.oName4.setRangeKeyFields([{
                    label: "Name4",
                    key: "Name4",
                    
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oName4.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oName4.setTokens(this._name4MultiInput.getTokens());
                this.oName4.open();


            },

            onName4VHOkPress: function (oEvent) {
             
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._name4MultiInput.setTokens(aTokens);
                this.oName4.close();
            },
            onName4VHCancelPress: function (oEvent) {
                this.oName4.close();
            },
            onName1VHAfterClose: function (oEvent) {
                this.oName4.destroy();
            },

            // -----------------------------End of Logic for Name4 Filter ------------------------------


                      // -----------------------------Start of Logic for City Filter -------------------------


                      onClickStreet: function () {


                        this.oStreet = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.street", this);
                        this.getView().addDependent(this.oStreet);
                        this.oStreet.setRangeKeyFields([{
                            label: "Street",
                            key: "Street",
                          
                            typeInstance: new TypeString({}, {
                                maxLength: 30
                            })
                        }]);
                        this.oStreet.setIncludeRangeOperations([
                    
                            FilterOperator.Contains,
                            FilterOperator.EQ,
                            FilterOperator.StartsWith,
                            FilterOperator.EndsWith,
                           
                        ]);
                        this.oStreet.setTokens(this._streetMultiInput.getTokens());
                        this.oStreet.open();
        
        
                    },
        
                    onStreetOkPress: function (oEvent) {
                     
                        var aTokens = oEvent.getParameter("tokens");
        
                        //     if(aTokens.length !== 0)
                        //  {
                        //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                        //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                        //  }
                        this._streetMultiInput.setTokens(aTokens);
                        this.oStreet.close();
                    },
                    onStreetCancelPress: function (oEvent) {
                        this.oStreet.close();
                    },
                    onStreetAfterClose: function (oEvent) {
                        this.oStreet.destroy();
                    },
        
                    // -----------------------------End of Logic for Street Filter ------------------------------
            

            // -----------------------------Start of Logic for City Filter -------------------------


            onClickCity: function () {


                this.oCity = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.cityVH", this);
                this.getView().addDependent(this.oCity);
                this.oCity.setRangeKeyFields([{
                    label: "City",
                    key: "City",
                   
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oCity.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oCity.setTokens(this._cityMultiInput.getTokens());
                this.oCity.open();


            },

            onCityVHOkPress: function (oEvent) {
             
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._cityMultiInput.setTokens(aTokens);
                this.oCity.close();
            },
            onCityVHCancelPress: function (oEvent) {
                this.oCity.close();
            },
            onCityVHAfterClose: function (oEvent) {
                this.oCity.destroy();
            },

            // -----------------------------End of Logic for State Filter ------------------------------


            // onClickState: function () {


            //     this.oState = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.stateVH", this);
            //     this.getView().addDependent(this.oState);
            //     this.oState.setRangeKeyFields([{
            //         label: "State",
            //         key: "State",
            //         type: "string",
            //         typeInstance: new TypeString({}, {
            //             maxLength: 30
            //         })
            //     }]);

            //     this.oState.setTokens(this._stateMultiInput.getTokens());
            //     this.oState.open();


            // },

            onStateVHOkPress: function (oEvent) {
              
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._stateMultiInput.setTokens(aTokens);
                this.oState.close();
            },
            onStateVHCancelPress: function (oEvent) {
                this.oState.close();
            },
            onStateVHAfterClose: function (oEvent) {
                this.oState.destroy();
            },

            // -----------------------------End of Logic for State Filter ------------------------------

            // -----------------------------End of Logic for ZipCode Filter ------------------------------


            onClickZipCode: function () {


                this.oZipCode = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.zipCodeVH", this);
                this.getView().addDependent(this.oZipCode);
                this.oZipCode.setRangeKeyFields([{
                    label: "Zip Code",
                    key: "ZipCode",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oZipCode.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oZipCode.setTokens(this._zipCodeMultiInput.getTokens());
                this.oZipCode.open();


            },

            onZipCodeVHOkPress: function (oEvent) {
              
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._zipCodeMultiInput.setTokens(aTokens);
                this.oZipCode.close();
            },
            onZipCodeVHCancelPress: function (oEvent) {
                this.oZipCode.close();
            },
            onZipCodeVHAfterClose: function (oEvent) {
                this.oZipCode.destroy();
            },

            // -----------------------------End of Logic for ZipCOde Filter ------------------------------

            // -----------------------------End of Logic for Country Filter ------------------------------


            onClickCountry: function () {


                this.oCountry = sap.ui.xmlfragment("com.iloc.search.zilocsearch.fragment.countryVH", this);
                this.getView().addDependent(this.oCountry);
                this.oCountry.setRangeKeyFields([{
                    label: "Country",
                    key: "Country",
                  
                    typeInstance: new TypeString({}, {
                        maxLength: 30
                    })
                }]);
                this.oCountry.setIncludeRangeOperations([
                    
                    FilterOperator.Contains,
                    FilterOperator.EQ,
                    FilterOperator.StartsWith,
                    FilterOperator.EndsWith,
                   
                ]);
                this.oCountry.setTokens(this._countryMultiInput.getTokens());
                this.oCountry.open();


            },

            onCountryVHOkPress: function (oEvent) {
             
                var aTokens = oEvent.getParameter("tokens");

                //     if(aTokens.length !== 0)
                //  {
                //     this.oFilter.soldToVal1 = aTokens[0].mAggregations.customData[0].mProperties.value.value1;
                //     this.oFilter.soldToVal2 = aTokens[0].mAggregations.customData[0].mProperties.value.value2;
                //  }
                this._countryMultiInput.setTokens(aTokens);
                this.oCountry.close();
            },
            onCountryVHCancelPress: function (oEvent) {
                this.oCountry.close();
            },
            onCountryVHAfterClose: function (oEvent) {
                this.oCountry.destroy();
            },

            // -----------------------------End of Logic for Country Filter ------------------------------

            // -------------------------------- Start of Search Functionality ---------------------------

            onSearch: function (oEvent) {


                var oFilterBar = oEvent.getSource();
                var aFilterItems = oFilterBar.getFilterGroupItems();

                var oFilter = [];

            
                    var aFilters = aFilterItems.map(function (oFilterItem) {
                        var sFilterName = oFilterItem.getName();
                        var oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
                        var sValue;


                        if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'ILOC') {

                            // sValue = "20240110";
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {


                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");

                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "StorageLocation",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                            else{
                                                oFilter.push(new Filter({
                                                    path: "StorageLocation",
                                                    operator: oRange.operation,
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }

                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Plant') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {


                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");

                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Plant",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                            else{
                                             
                                                oFilter.push(new Filter({
                                                    path: "Plant",
                                                    operator: oRange.operation,
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }

                                    }

                                });
                            }

                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Name1') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {
                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Name1",
                                                    operator:"NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                            else{
                                             
                                                oFilter.push(new Filter({
                                                    path: "Name1",
                                                    operator:oRange.operation,
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }



                                     
                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Name2') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");

                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Name2",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                            else{
                                             
                                                oFilter.push(new Filter({
                                                    path: "Name2",
                                                    operator: oRange.operation,
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }

                                     
                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Name3') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Name3",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                            else{
                                             
                                                oFilter.push(new Filter({
                                                    path: "Name3",
                                                    operator: oRange.operation,
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }

                                     
                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Name4') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                              
                                        oFilter.push(new Filter({
                                            path: "Name4",
                                            operator: "NE",
                                            value1: oRange.value1,
                                            value2: oRange.value2
                                        }));
                                            }
                                        else{   
                                                oFilter.push(new Filter({
                                                path: "Name4",
                                                operator: oRange.operation,
                                                value1: oRange.value1,
                                                value2: oRange.value2
                                              }));
                                            }


                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Street Address') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Street",
                                                    operator:"NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                        else{                                            

                                        oFilter.push(new Filter({
                                            path: "Street",
                                            operator: oRange.operation,
                                            value1: oRange.value1,
                                            value2: oRange.value2
                                        }));
                                            }

                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'City') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");



                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "City",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                        else{                                            

                                            oFilter.push(new Filter({
                                                path: "City",
                                                operator: oRange.operation,
                                                value1: oRange.value1,
                                                value2: oRange.value2
                                            }));
                                            }

                                     
                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'State') {
                            if (oControl.getTokens()) {
                                // sValue = oControl.mProperties._semanticFormValue;
                                // oFilter.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, sValue));
                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {
                                    if (oToken.mProperties.text !== '') {


                                        
                                        oFilter.push(new Filter({
                                            path: "State",
                                            operator: 'EQ',
                                            value1: oToken.mProperties.text

                                        }));
                                    }
                                 
                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Zip Code') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "PostalCode",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                        else{                                            

                                            oFilter.push(new Filter({
                                                path: "PostalCode",
                                                operator: oRange.operation,
                                                value1: oRange.value1,
                                                value2: oRange.value2
                                            }));
                                            }

                                    
                                    }

                                });
                            }
                        }
                        else if (oControl.getMetadata().getName() === "sap.m.MultiInput" && oFilterItem.mProperties.label === 'Country') {
                            if (oControl.getTokens()) {

                                var aTokens = oControl.getTokens();
                                var aFilters = aTokens.map(function (oToken) {

                                    if (oToken.data("range")) {
                                        var oRange = oToken.data("range");


                                        if(oRange.exclude === true && oRange.operation === "EQ")
                                            {
                                                oFilter.push(new Filter({
                                                    path: "Country",
                                                    operator: "NE",
                                                    value1: oRange.value1,
                                                    value2: oRange.value2
                                                }));
                                            }
                                        else{                                            

                                            oFilter.push(new Filter({
                                                path: "Country",
                                                operator: oRange.operation,
                                                value1: oRange.value1,
                                                value2: oRange.value2
                                            }));
                                            }

                                     
                                    }

                                });
                            }
                        }


                        //  new sap.ui.model.Filter(sFilterName, "EQ", sValue);
                        return oFilter;
                    }, this);

                    var oModel = this.getView().getModel();
                    sap.ui.core.BusyIndicator.show(0);

                    //  oModel.read("/RETURN_ORDERSet(SerialNumber='" + scanner[0] + "')", {
                    // oModel.read("/ILOCSet", {
                    //     filters: oFilter,
                    //     success: function (oData, oResponse) {

                    //         this.iLocSearchModel = new JSONModel();
                    //         var obj = oResponse.data.results;
                    //         this.iLocSearchModel.setData(obj);

                    //         this.getView().setModel(this.iLocSearchModel, "iLocSearchModel");
                    //         sap.ui.core.BusyIndicator.hide();
                    //     }.bind(this),
                    //     error: function (oError) {
                    //         sap.ui.core.BusyIndicator.hide();
                    //         this.iLocSearchModel = new JSONModel();
                    //         //     this.returnOrderModel = new JSONModel();
                    //         //   this.instaCalendarModel.setData(null);
                    //         this.getView().getModel("iLocSearchModel").setData(null);
                    //         MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                    //     }.bind(this),
                    // });
                    // var fCountry = new Filter("Country", "EQ", "US");
                    this.getOwnerComponent().getModel().read("/ILOCSet", {
                        filters: oFilter,
                        success: function (res) {
                            sap.ui.core.BusyIndicator.hide();
                            // this.oModel.setProperty("/StateData", res.results);
                            this.iLocSearchModel = new JSONModel();
                            this.iLocSearchModel.setData(res.results);
                            this.getView().setModel(this.iLocSearchModel, "iLocSearchModel");
                            if (res.results.length === 0) {
                                sap.m.MessageToast.show("No records found for this selection criteria.!");
                            }
    
                        }.bind(this),
                        error: function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show("No Data Found.!");
                            // sap.m.MeiLocSearchModelssageToast.show(error);
                            this.getView().setModel(this.iLocSearchModel, "iLocSearchModel");
                           // this.iLocSearchModel = new JSONModel();
                            this.iLocSearchModel.setData({});
                        }.bind(this)
                    });
                



            },


         
            // -------------------------------- End of Search Functionality -----------------------------
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            _updateListItemCount: function (iTotalItems) {
                var sTitle;
                // only update the counter if the length is final
                if(this._oList.getBinding("items") !== undefined)
                {
                if (this._oList.getBinding("items").isLengthFinal()) {
                    sTitle = this.getResourceBundle().getText("iLocDetails", [iTotalItems]);
                    this.getView().byId("idTableHeader").setText(sTitle);
                    // this.getModel("masterView").setProperty("/title", sTitle);
                }
            }
            else{
                sTitle = this.getResourceBundle().getText("iLocDetails", [iTotalItems]);
                this.getView().byId("idTableHeader").setText(sTitle);
            }
            },
            /**
            * After list data is available, this handler method updates the
            * master list counter
            * @param {sap.ui.base.Event} oEvent the update finished event
            * @public
            */
            onUpdateFinished: function (oEvent) {
                // update the master list object counter after new data is loaded
                this._updateListItemCount(oEvent.getParameter("total"));

            },
        });
    });
