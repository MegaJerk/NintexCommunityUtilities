/* global NWF$, NWF, NF, Page_ClientValidate, Page_Validators, outerDiv, ValidatorOnLoad, _spPageContextInfo */
/* eslint-env browser */
/* eslint no-console: ["error", { allow: ["log", "error"] }]  */

/*global 
  NWF$, NWF, NF, Page_ClientValidate, Page_Validators, outerDiv, ValidatorOnLoad, _spPageContextInfo 
*/

////////////////////////////// NCU-Core.js //////////////////////////////
//  Version: 1.0
//	Author: MegaJerk
//	gitHub: https://github.com/MegaJerk
//	Nintex: https://community.nintex.com/t5/user/viewprofilepage/user-id/8331
//
// 	Remember: Use this code at your own risk! 
//	I am not responsible for your SharePoint or Nintex Misadventures!
//	Test twice, deploy once! <3
/////////////////////////////////////////////////////////////////////////////

var NCU = (function (NCU, options) {
	"use strict";

	// console.log("loading NCU-Core.js");
	//  All variables that our functions rely on, or would otherwise be placed into the global-scope
	//  live here inside of the FormVariables property. 
	NCU.FormVariables = (function (FormVariables) {

		//  Used by any Rule (Validation or Formatting) that needs to consider the Form's state. 
		//  Is set to true during the RegisterAfterReady form event.
		FormVariables.pageIsReady = false;

		//	Used to check on the status of _spPageContextInfo, which can sometimes not load correctly.
		FormVariables.pageContextDefined = typeof _spPageContextInfo !== "undefined";

		//	Provides an easy way to check for the Form Type without having to use the built in
		//	Nintex Form Reference.
		FormVariables.formType = (function (formTypeText) {
			formTypeText = formTypeText.replace(/([^/]*(?=\/))\/|\..+/gi, "");
			return {
				IsEditMode: formTypeText === "EditForm",
				IsDisplayMode: formTypeText === "DispForm",
				IsNewMode: formTypeText === "NewForm",
				IsPreviewForm: formTypeText === "PreviewNintexForm"
			};
		}(FormVariables.pageContextDefined ? _spPageContextInfo.serverRequestPath : window.location.href));

		return FormVariables;
	}(NCU.FormVariables || {}));

	// All functions that are exposed or added will be put here in the FormFunctions property.
	NCU.FormFunctions = (function (FormFunctions) {

		//  getLabelText: Returns the text of a Label Control passed to it.
		//
		//  Return Type: String
		FormFunctions.getLabelText = function (labelControl) {
			labelControl = (
				NWF$(labelControl).attr("for") ?
				NWF$(labelControl) :
				NWF$(labelControl).find("label[for]")
			);
			return NWF$(labelControl).text().replace(/"+|\u200B+|\u00A0+|\*(?=$)/gm, "");
		};


		//  getAssociatedControlForLabel: Will attempt to find a Control that has been associated
		//  to the passed in Label Control. If no match can be found, an empty jQuery object will be returned.
		//
		//  Return Type: jQuery Object
		FormFunctions.getAssociatedControlForLabel = function (labelControl, labelContext) {

			labelControl = NWF$(labelControl);
			labelContext = (labelContext || NWF$(document));

			if (labelControl.length !== 1 || typeof labelControl.find("[for]").attr("for") === undefined) {
				return undefined;
			}

			var labelFor = labelControl.find("[for]").attr("for");
			var associatedControl = labelContext.find("[id*='" + labelFor + "']:not" + "(.nf_rulesvalidators)");

			if (associatedControl.length < 1) {
				var contextContainer = ((labelContext.hasClass("nf-repeater-row") && !labelContext.hasClass("nf-repeater-row-hidden")) ?
					NWF$(labelContext.siblings()[0]) :
					labelContext);

				var convertedFor = (function (updatedFor) {
					var matchedCTL = updatedFor.match(/((?=ctl\d+_)[^_]+_)/gm);
					if (matchedCTL !== null) {
						matchedCTL.forEach(function (matchedValue) {
							updatedFor = updatedFor.replace(matchedValue, matchedValue.replace("_", "$"));
						});

						updatedFor = updatedFor.replace(/([^$]+)$/gm, "");
					}
					return updatedFor;
				}(labelFor.replace(/\B(?=_(?=ctl|._|list|form))./gi, "$")));

				var foundControl = contextContainer.find("[name*='" + convertedFor + "']").closest(".nf-filler-control");
				associatedControl = labelContext.find("[data-controlname='" + foundControl.attr("data-controlname") + "']");
			} else {
				associatedControl = NWF$(associatedControl[0]).closest(".nf-filler-control");
			}

			return associatedControl;
		};


		//  getAssociatedLabelForControl: Will attempt to find a Label that has been associated
		//  to the non-label control passed into it. 
		//
		//  Return Types: String (default), jQuery Object (if returnControl === true)

		//  Return Type(s): String (returnControl !== true) || jQuery Object (returnControl === true)
		//  ----------------
		//  getAssociatedLabelForControl("myLabel", NWF$(document)) 			// "My Label Text:"
		//  getAssociatedLabelForControl("myLabel", NWF$(document), true) // jQuery Object
		//  ----------------
		FormFunctions.getAssociatedLabelForControl = function (controlName, sourceContext, returnControl) {

			//  Before anything can happen. If the controlName isn't a string or is blank...
			if (typeof controlName !== "string" || controlName === "") {
				//  Return an empty string
				return "";
			}

			sourceContext = (sourceContext || NWF$(document));
			returnControl = (returnControl === true);
			var sourceControl = sourceContext.find("[data-controlname='" + controlName + "']");
			var contextContainer;
			var controlInternalName;
			var labelControl;

			//  If we find 0 controls under the given name, then we have a problem.
			//  Return an empty string.
			if (sourceControl.length === 0) {
				return "";
			} else {

				//  Otherwise...
				//  If we do find a control under the given name, but more than (1)...
				if (sourceControl.length > 1) {

					//  It's safe to assume that it's part of a repeating section (because Nintex will
					//  not allow you to give more than one control the same name in any other instance).
					//  Because of that, we'll need to filter out the hidden 'root' control that is in
					//  the hidden 'root' Repeating Section Row that is used as the Parent Row for all
					//  of the Rows that are visible to the user!
					sourceControl = sourceControl.filter(function (index, control) {
						return !NWF$(control).closest(".nf-repeater-row").hasClass("nf-repeater-row-hidden");
					});

					//  Finally, we'll go through each row return the label text into an array that
					//  is then returned to the user
					return sourceControl.map(function (index, control) {
						return FormFunctions.getAssociatedLabelForControl(controlName, NWF$(control).closest(".nf-repeater-row"));
					}).toArray();

				} else {

					//  Otherwise...
					//  If we only find (1) Control under the given controlName...

					//  Get the inner Control's 'name' attribute and then replace all of the "$" symbols with "_".
					//  Additionally, drop the ending portion after the last underscore off of it
					controlInternalName = sourceControl.find("[formcontrolid][name]")[0].name.replace(/\$/gm, "_").replace(/_(?=[a-zA-Z]+[0-9]+$).*/gm, "");

					//  Using that string, search the sourceContext for any label with a for containing the
					//  previously generated string stored in our controlInternalName variable.
					labelControl = sourceContext.find("label[for*='" + controlInternalName + "']");

					//  If nothing is found...
					if (labelControl.length === 0) {

						//  Set the contextContainer variable to the hidden Root Node
						contextContainer = (
							sourceContext.hasClass("nf-repeater-row") ?
							NWF$(sourceContext.siblings()[0]) :
							sourceContext
						);

						//  Find the Control with the given controlName in that parentContext, and return
						//  the name attribute once it has been converted by regex.
						//
						//  [Previously]
						//  controlInternalName = contextContainer.find("[data-controlname='" + controlName + "'] [formcontrolid][name]")[0].name.replace(/\$/gm, "_").replace(/_(?=[a-zA-Z]+[0-9]+$).*/gm, "");
						controlInternalName = contextContainer.find("[data-controlname='" + controlName + "'] [formcontrolid][name]")[0].name.replace(/\$/gm, "_").replace(/([^_]+)$/gm, "");

						//  Search for the label in the sourceContext again, but using this updated string
						labelControl = sourceContext.find("label[for*='" + controlInternalName + "']");
					}

					//  if returnControl is true, then return the jquery object containing the Label element
					//  otherwise just return the text if the 'getLabelText' can produce a meaningful result
					return (
						returnControl ?
						labelControl :
						FormFunctions.getLabelText(labelControl)
					);
				}
			}
		};


		//  getControlByEval: Primarily used for rules (more specifically, Formatting Rules) that need to reference
		//  the Control that is running the Rule is associated with. It requires two arguments, the first of which
		//  needing to be the literal string "{Control:Self}", and second being the variable sourceContext which is
		//  available from within the scope of the Formatting Rule being executed. 
		//
		//  Return Type: Object
		//  ----------------
		//  {
		//    formcontrolid 				(String): The control's formcontrolid attribute
		//    controlContainer 	(jQuery Obj): A jQuery Object of the outermost <div> of the control
		//    associatedControl (jQuery Obj): *as of now* A 'Guess' at the innermost control that provides the value.
		//  }
		//  ----------------
		FormFunctions.getControlByEval = function (evalStatement, sourceContext) {

			sourceContext = (sourceContext || NWF$(document));
			var formControlID = evalStatement.split("'")[1] || "";
			var controlContainer = sourceContext.find("[formcontrolid='" + formControlID + "'].nf-filler-control");
			var associatedControl = controlContainer.find("[formcontrolid='" + formControlID + "'].nf-associated-control");

			return {
				"formcontrolid": formControlID,
				"controlContainer": controlContainer,
				"associatedControl": associatedControl
			};
		};


		//  getControlValueByName: Will return the value that the Nintex function
		//  "GetValue" would normally return, but allows you to use a Control's Name rather
		//  than having to find its "formcontrolid" attribute value.
		//
		//  Because the backing GetValue function returns a Number type value if a Control's value
		//  evaluates to a valid number (isNumeric(val)), you'll need to set the getValueAsString
		//  argument to true if you're expecting a string.
		//
		//  If the sourceContext is not provided, and Controls are found (using the controlName argument)
		//  inside of a repeating section, an Array will be returned and the getValueAsString argument is ignored.
		//  
		//  If the name provided does not match up to a valid Control, then an empty string ("") is returned.
		//
		//  Return Type(s): String, Number, Array (getValueAsString !== true) || String, Array (getValueAsString === true)
		//  ----------------
		//  getControlValueByName("priceControl", repeatingSectionRow1) 			// 30
		//  getControlValueByName("priceControl", repeatingSectionRow1, true) // "30"
		//	getControlValueByName("priceControl", repeatingSection) 					// [30, 20, 10]
		//	getControlValueByName("priceControl", repeatingSection, true) 		// [30, 20, 10]
		//  ----------------
		FormFunctions.getControlValueByName = function (controlName, sourceContext, getValueAsString) {

			if (getValueAsString) {
				getValueAsString = "string2";
			}

			sourceContext = (sourceContext || NWF$(document));

			var targetFormControlID = sourceContext.find("[data-controlname='" + controlName + "']").attr("formcontrolid");
			NWF.FormFiller.Functions.GetValueContextCache(sourceContext)[targetFormControlID] = undefined;
			var rawValue = NWF.FormFiller.Functions.GetValue(targetFormControlID, sourceContext, getValueAsString);
			return rawValue;
		};
		
		
		//  getControlByName: Will return the a jQuery object containing the outermost <div> container
		//	of the specified control (in the specified context), if a Control of the name can be found.
		//  
		//  Return Type(s): jQuery Object
		//  ----------------
		//  getControlByName("priceControl", repeatingSectionRow1) 	// A jQuery Object of the outermost <div> of the control from repeatingSectionRow1
		//  getControlByName("priceControl")										// A jQuery Object of the outermost <div> of *any* controls named "priceControl"
		//  ----------------
		FormFunctions.getControlByName = function (controlName, sourceContext) {
			sourceContext = (sourceContext || NWF$(document));
			return sourceContext.find("[data-controlname='" + controlName + "']");			
		};
		

		//  hideRepeatingSectionPanels: Will hide a Panel inside of a Repeating Section.
		//  It requires an array of classes that will be iterated over, and any Panels found which have a matching
		//  class will be hidden. Additionally it will force the Row to resize.
		//
		//  Return Type: undefined
		FormFunctions.hideRepeatingSectionPanels = function (panelClassArray) {

			if (NWF$.isArray(panelClassArray)) {

				NWF$.each(panelClassArray, function (index, panelClass) {

					if (panelClass) {

						if (panelClass.match(/^\./) === null) {
							panelClass = "." + panelClass;
						}

						NWF$(panelClass + ".nf-filler-control").each(function (index, targetPanel) {
							//  Get the current Panel that we're iterating over
							targetPanel = NWF$(targetPanel);

							//  Get the current Row that the Panel is in
							var currentRow = targetPanel.closest(".nf-repeater-row");

							//  If the Panel is NOT visible (because it was hidden by a RULE)
							if (!(targetPanel.is(":visible"))) {

								//  Get the Outermost Height of the Panel
								var panelHeight = targetPanel.outerHeight();

								//  If the CURRENT ROW is not the HIDDEN ROOT ROW, then we need resize our Canvas / Form
								//  Because the Panel was actually taking up space there!
								if (!currentRow.hasClass("nf-repeater-row-hidden")) {
									NCU.FormFunctions.RepositionAndResizeOtherControlsAndFillerContainerHeight(currentRow, -panelHeight, -panelHeight, NWF$("#formFillerDiv"));
								}

								//Then we take the Height out of the Row itself (because RS Rows do not auto resize)
								currentRow.outerHeight(currentRow.outerHeight() - panelHeight);
							}
						});
					}
				});
			}
		};


		//  pageIsValid: If ran from an Form in Edit Mode, it will first invoke the Out Of Box 'Page_ClientValidate()' function
		//  (provided by Nintex) which simply runs all of the Validation Rules, and will subsequently hide
		//  the Error Summary Messages (typically located at the top of the form in red colored text). 
		//
		//	If ran from a Form that is NOT in Edit Mode will ALWAYS return true. 
		//  
		//  Returns Boolean: 
		//  ----------------
		//  Passing (Valid) 	= true
		//  Failure (Invalid) = false
		//  ----------------
		FormFunctions.pageIsValid = function pageIsValid() {
			return (typeof Page_ClientValidate === "undefined" || (Page_ClientValidate() && NWF$(".nf-validation-summary").hide().length > -1));
		};


		//  rebuildHiddenRepeaterSections: Nintex Forms incorrectly zeros out the Container Height for any Repeater Sections that are hidden.
		//  This can cause all sorts of problems, but essentially makes it impossible to have two or more Repeating Sections
		//  where one or more of them is hidden at any particular time.
		//
		//  Because any Row Add or Row Delete will cause the Heights of ALL Repeating Sections to be recalculated, this 
		//  helper function needed to be made in order to re-calculate the heights and fix them immediately after they are ruined.
		//
		//  This Function will be run from the exposed Nintex Forms Events RegisterRepeaterRowAdded, and RegisterRepeaterRowDeleted.
		//
		//  For more information, see: https://community.nintex.com/t5/Nintex-for-SharePoint/problem-with-tabs-and-repeating-sections/m-p/20229/highlight/true#M16756
		//
		//  Return Type: undefined
		FormFunctions.rebuildHiddenRepeaterSections = function (eventRow) {
			var thisRepeatingSection = eventRow.closest("[data-controlname]");
			var thisFormControlID = thisRepeatingSection.attr("formcontrolID");
			var formFillerDivCurrent = NWF.FormFiller.Functions.GetFormFillerDiv();
			var siblingRepeatingSection = formFillerDivCurrent.find(".nf-repeater:hidden").closest("[data-controlname]").not("[formcontrolid='" + thisFormControlID + "']");
			siblingRepeatingSection.each(function (index, section) {

				var thisSiblingSection = NWF$(section);
				var thisRepeaterControl = thisSiblingSection.find(".nf-repeater");
				var thisRepeaterInnerControl = thisRepeaterControl.parent();
				var thisSiblingSectionRows = thisSiblingSection.find(".nf-repeater-row:not(.nf-repeater-row-hidden)");

				var totalRowHeight = 0;
				thisSiblingSectionRows.each(function (index, row) {
					totalRowHeight += NWF$(row).outerHeight();
				});

				if (totalRowHeight > thisRepeaterControl.height()) {
					thisRepeaterControl.height(totalRowHeight);
				}

				thisRepeaterInnerControl.height(thisRepeaterControl.height());

				if (thisSiblingSection[0].className.indexOf("nf-error-highlight") !== -1) {
					thisSiblingSection.outerHeight(thisRepeaterControl.outerHeight() + 4);
				} else {
					thisSiblingSection.outerHeight(thisRepeaterControl.outerHeight());
				}
			});
		};

		//  RepositionAndResizeOtherControlsAndFillerContainerHeight: Isn't a true 'function' persay, but instead -
		//	a normalization of a Nintex provided function that, through updates, has changed locations in their code. 
		//	To learn what the functions does and how it works, please see their (Nintex's) code found in one of the two -
		//	namespaces being referneced.
		FormFunctions.RepositionAndResizeOtherControlsAndFillerContainerHeight = (function(){
			var returnFunc;
			try {
				returnFunc = (
					NWF.FormFiller.Functions.RepositionAndResizeOtherControlsAndFillerContainerHeight ||
					NWF.FormFiller.Resize.RepositionAndResizeOtherControlsAndFillerContainerHeight
				);
			} catch(e){
				// console.log("Unable to find the RepositionAndResizeOtherControlsAndFillerContainerHeight function.");
				console.log(e);
			} finally {
				if (returnFunc === undefined) {
					returnFunc = function(){return false;};
				}
			}
			return returnFunc;
		}());


		//  setCanvasContainerHeight: Fixes the incorrect way that Nintex Forms increase / decrease the
		//  height of the Form Canvas. By leaving in the FormFiller Events below, all instances where the height would
		//  have a chance to grow out of control in either direction, should be fixed
		//
		//  Return Type: undefined
		FormFunctions.setCanvasContainerHeight = function () {
			if (outerDiv.data("outerDivHeight") !== outerDiv.height()) {
				outerDiv.outerHeight(outerDiv.height());
				outerDiv.data("outerDivHeight", outerDiv.height());
			}
		};

		return FormFunctions;

	}(NCU.FormFunctions || {}));

	///////////////////////////// Nintex Form Events ////////////////////////////
	//  There are several Nintex Forms Events that need to be setup that
	//	rely on some of the above functions / variables to fix problems that
	//  exist naturally in the Nintex Forms Codebase.
	/////////////////////////////////////////////////////////////////////////////

	//  Validator Rules can sometimes become orphaned when a New Row is added.
	//  Running the Nintex made function ValidatorOnLoad, can reattach Rules to their associated Controls.
	//  The following event will make sure that the function runs every time
	//	a row is added if the function (ValidatorOnLoad) can be found.
	if (typeof ValidatorOnLoad !== "undefined") {
		NWF.FormFiller.Events.RegisterRepeaterRowAdded(function () {
			ValidatorOnLoad();
		});
	}
	
	//	Repeating Sections don't always clean up after themselves when you delete a Row,
	//	leaving behind Validation Rule references pointing to Controls that have been removed.
	//	Because of this, we'll need to clean up the global Page_Validators array ourselves,
	//	first looking for any validator span elements, and then removing them from the global
	//	array if found. 
	if (typeof Page_Validators !== "undefined") {
		NWF.FormFiller.Events.RegisterRepeaterRowDeleting(function (thisRow) {
			thisRow.children(".nf-validator-error").each(function (index, validator) {
				if (Page_Validators.indexOf(validator) > -1) {
					Page_Validators.splice(Page_Validators.indexOf(validator), 1);
				}
			});
		});
	}

	//  Every time that a Repeating Section has a Row Added or Deleted, any hidden Repeating Section
	//  will need to be rebuilt (if any), and the Canvas Height will need to be readjusted as the
	//  default math behind resizing it is incorrect.
	NWF.FormFiller.Events.RegisterRepeaterRowAdded(function (thisRow) {
		NCU.FormFunctions.rebuildHiddenRepeaterSections(thisRow);
		NCU.FormFunctions.setCanvasContainerHeight();
	});

	NWF.FormFiller.Events.RegisterRepeaterRowDeleted(function (thisRow) {
		NCU.FormFunctions.rebuildHiddenRepeaterSections(thisRow);
		NCU.FormFunctions.setCanvasContainerHeight();
	});

	//	Anytime a Formatting Rule shows or hides a Control, the height of the canvas is,
	//	by default, incorrectly recalculated. The following two Form events will correctly
	//	readjust the Form Canvas to the correct size.
	NWF.FormFiller.Events.RegisterControlShowHidePropagated(function (targetControl) {
		if (targetControl.data("RepositionControls")) {
			NCU.FormFunctions.setCanvasContainerHeight();
		}
	});

	NWF.FormFiller.Events.RegisterRuleProcessed(function(){
		NCU.FormFunctions.setCanvasContainerHeight();	
	});

	//	Anytime a Control's height adjustment results in a sibling Control being repositioned
	//	the canvas will be resized, by default, incorrectly.
	//	The following Form event will correctly	readjust the Form Canvas to the correct size.
	NWF.FormFiller.Events.RegisterControlHeightChangePropagated(function () {
		NCU.FormFunctions.setCanvasContainerHeight();
	});	

	//  When Nintex introduced Responsive Forms, Classic Forms sometimes has trouble loading the
	//  a JavaScript Library that is referenced in the updated code that handles Adding Repeating
	//  Section Rows. If the library isn't found, the code will error, and the Row will be incorrectly
	//  added, causing problems for the Form. 
	//
	//  The below code attempt to manually load the library from your SharePoint environment if it is not already
	//  loaded, but in the event of failure, will tell you in the console. Just because it fails, doesn't mean
	//  that the library is needed (or even present) as it was only added AFTER Responsive Forms were included
	//  with the product. 
	//
	//  Afterwards, a canvas height correction will be made (regardless of the success or failure of the try/catch).
	//
	//  Everything in this Registered Event will be ran only ONCE, before the form is ready.
	NWF.FormFiller.Events.RegisterBeforeReady(function () {
		if (typeof NF.BaseDataAccessHelper === "undefined" && NCU.FormVariables.pageContextDefined) {
			try {
				// console.log("Attempting to load missing js file: 'NF.BaseDataAccessHelper.js'");
				NWF$.getScript(_spPageContextInfo.siteAbsoluteUrl.replace(/sites.+/, "") + _spPageContextInfo.layoutsUrl + "/NintexForms/JavaScriptStringHandler.ashx?" + "resourceType=jsfile&" + "fileName=NF.BaseDataAccessHelper.js&" + "culture=" + _spPageContextInfo.currentCultureName);
			} catch (e) {
				// console.log("There was a problem loading the BaseDataAccessHelper using the JavaScriptStringHandler!");
				// console.log("Your version of Nintex Forms may not rely on it, or there could be something configured incorrectly");
				// console.log("If your Repeating Sections can Add Rows without breaking, then it's unnecessary.");
				console.log(e);
			}
		}
		
		outerDiv.outerHeight(outerDiv.height());
	});

	//  When the Form is ready and has everything loaded, this will be the last Registered Event to run. 
	//  It will correctly set the Height of the Form Canvas, and will set our pageIsReady variable to true.
	NWF.FormFiller.Events.RegisterAfterReady(function () {
		outerDiv.data("outerDivHeight", outerDiv.height());
		NCU.FormVariables.pageIsReady = true;
	});

	//	By default Nintex Forms prevents browsers (or at least Chrome) from using their built in spellcheck.
	//	By setting the initialization argument enableBrowserSpellcheck property to true (default), once the
	//	form is loaded, the browser's spellcheck will be re-enabled.
	if (options.enableBrowserSpellcheck) {

		//	This used to only use the Nintex Forms Event "RegisterAfterReady", however, after finding that
		//	the form would *sometimes* not actually load with the browser spellcheck enabled, it became
		//	apparent that something else was sometimes undoing the attribute changes this code was making.
		//
		//	After much digging I found that there is a library (ms.rte.js) that can load somewhere in between
		//	the Form's Ready State and the Window's Loaded state.
		//
		//	The following code is a bit verbose but should absolutely make sure that the browser spellcheck
		//	is left enabled... I hope!
		window.onload = function () {
			if (typeof RTE === "object" && !document.body.spellcheck) {
				NWF$("body").attr("spellcheck", true);
			} else {
				NWF.FormFiller.Events.RegisterAfterReady(function () {
					NWF$("body").attr("spellcheck", true);
				});
			}
		};
	}

	return NCU;
}(
	(NCU || {}), {
		enableBrowserSpellcheck: true
	}
));