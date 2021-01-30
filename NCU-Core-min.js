var NCU=function(o){"use strict";var e,t,i;return o.FormVariables=((e=o.FormVariables||{}).pageIsReady=!1,e.pageContextDefined="undefined"!=typeof _spPageContextInfo,e.formType={IsEditMode:"EditForm"===(t=(t=e.pageContextDefined?_spPageContextInfo.serverRequestPath:window.location.href).replace(/([^/]*(?=\/))\/|\..+/gi,"")),IsDisplayMode:"DispForm"===t,IsNewMode:"NewForm"===t,IsPreviewForm:"PreviewNintexForm"===t},e),o.FormFunctions=((i=o.FormFunctions||{}).getLabelText=function(e){return e=NWF$(e).attr("for")?NWF$(e):NWF$(e).find("label[for]"),NWF$(e).text().replace(/"+|\u200B+|\u00A0+|\*(?=$)/gm,"")},i.getAssociatedControlForLabel=function(e,t){if(e=NWF$(e),t=t||NWF$(document),1===e.length&&(e.find("[for]").attr("for"),1)){var n,o=e.find("[for]").attr("for"),r=t.find("[id*='"+o+"']:not(.nf_rulesvalidators)");return r=r.length<1?(e=t.hasClass("nf-repeater-row")&&!t.hasClass("nf-repeater-row-hidden")?NWF$(t.siblings()[0]):t,n=o.replace(/\B(?=_(?=ctl|._|list|form))./gi,"$"),null!==(o=n.match(/((?=ctl\d+_)[^_]+_)/gm))&&(o.forEach(function(e){n=n.replace(e,e.replace("_","$"))}),n=n.replace(/([^$]+)$/gm,"")),o=n,o=e.find("[name*='"+o+"']").closest(".nf-filler-control"),t.find("[data-controlname='"+o.attr("data-controlname")+"']")):NWF$(r[0]).closest(".nf-filler-control")}},i.getAssociatedLabelForControl=function(n,e,t){if("string"!=typeof n||""===n)return"";t=!0===t;var o,r=(e=e||NWF$(document)).find("[data-controlname='"+n+"']");return 0===r.length?"":1<r.length?(r=r.filter(function(e,t){return!NWF$(t).closest(".nf-repeater-row").hasClass("nf-repeater-row-hidden")})).map(function(e,t){return i.getAssociatedLabelForControl(n,NWF$(t).closest(".nf-repeater-row"))}).toArray():(o=r.find("[formcontrolid][name]")[0].name.replace(/\$/gm,"_").replace(/_(?=[a-zA-Z]+[0-9]+$).*/gm,""),0===(r=e.find("label[for*='"+o+"']")).length&&(o=(e.hasClass("nf-repeater-row")?NWF$(e.siblings()[0]):e).find("[data-controlname='"+n+"'] [formcontrolid][name]")[0].name.replace(/\$/gm,"_").replace(/([^_]+)$/gm,""),r=e.find("label[for*='"+o+"']")),t?r:i.getLabelText(r))},i.getControlByEval=function(e,t){t=t||NWF$(document);var n=e.split("'")[1]||"",e=t.find("[formcontrolid='"+n+"'].nf-filler-control"),t=e.find("[formcontrolid='"+n+"'].nf-associated-control");return{formcontrolid:n,controlContainer:e,associatedControl:t}},i.getControlValueByName=function(e,t,n){n=n&&"string2";e=(t=t||NWF$(document)).find("[data-controlname='"+e+"']").attr("formcontrolid");return NWF.FormFiller.Functions.GetValueContextCache(t)[e]=void 0,NWF.FormFiller.Functions.GetValue(e,t,n)},i.getControlByName=function(e,t){return(t=t||NWF$(document)).find("[data-controlname='"+e+"']")},i.hideRepeatingSectionPanels=function(e){NWF$.isArray(e)&&NWF$.each(e,function(e,t){t&&(null===t.match(/^\./)&&(t="."+t),NWF$(t+".nf-filler-control").each(function(e,t){var n=(t=NWF$(t)).closest(".nf-repeater-row");t.is(":visible")||(t=t.outerHeight(),n.hasClass("nf-repeater-row-hidden")||o.FormFunctions.RepositionAndResizeOtherControlsAndFillerContainerHeight(n,-t,-t,NWF$("#formFillerDiv")),n.outerHeight(n.outerHeight()-t))}))})},i.pageIsValid=function(){return"undefined"==typeof Page_ClientValidate||Page_ClientValidate()&&-1<NWF$(".nf-validation-summary").hide().length},i.rebuildHiddenRepeaterSections=function(e){e=e.closest("[data-controlname]").attr("formcontrolID");NWF.FormFiller.Functions.GetFormFillerDiv().find(".nf-repeater:hidden").closest("[data-controlname]").not("[formcontrolid='"+e+"']").each(function(e,t){var n=NWF$(t),o=n.find(".nf-repeater"),r=o.parent(),t=n.find(".nf-repeater-row:not(.nf-repeater-row-hidden)"),i=0;t.each(function(e,t){i+=NWF$(t).outerHeight()}),i>o.height()&&o.height(i),r.height(o.height()),-1!==n[0].className.indexOf("nf-error-highlight")?n.outerHeight(o.outerHeight()+4):n.outerHeight(o.outerHeight())})},i.RepositionAndResizeOtherControlsAndFillerContainerHeight=function(){var e;try{e=NWF.FormFiller.Functions.RepositionAndResizeOtherControlsAndFillerContainerHeight||NWF.FormFiller.Resize.RepositionAndResizeOtherControlsAndFillerContainerHeight}catch(e){console.log(e)}finally{void 0===e&&(e=function(){return!1})}return e}(),i.setCanvasContainerHeight=function(){outerDiv.data("outerDivHeight")!==outerDiv.height()&&(outerDiv.outerHeight(outerDiv.height()),outerDiv.data("outerDivHeight",outerDiv.height()))},i),"undefined"!=typeof ValidatorOnLoad&&NWF.FormFiller.Events.RegisterRepeaterRowAdded(function(){ValidatorOnLoad()}),"undefined"!=typeof Page_Validators&&NWF.FormFiller.Events.RegisterRepeaterRowDeleting(function(e){e.children(".nf-validator-error").each(function(e,t){-1<Page_Validators.indexOf(t)&&Page_Validators.splice(Page_Validators.indexOf(t),1)})}),NWF.FormFiller.Events.RegisterRepeaterRowAdded(function(e){o.FormFunctions.rebuildHiddenRepeaterSections(e),o.FormFunctions.setCanvasContainerHeight()}),NWF.FormFiller.Events.RegisterRepeaterRowDeleted(function(e){o.FormFunctions.rebuildHiddenRepeaterSections(e),o.FormFunctions.setCanvasContainerHeight()}),NWF.FormFiller.Events.RegisterControlShowHidePropagated(function(e){e.data("RepositionControls")&&o.FormFunctions.setCanvasContainerHeight()}),NWF.FormFiller.Events.RegisterRuleProcessed(function(){o.FormFunctions.setCanvasContainerHeight()}),NWF.FormFiller.Events.RegisterControlHeightChangePropagated(function(){o.FormFunctions.setCanvasContainerHeight()}),NWF.FormFiller.Events.RegisterBeforeReady(function(){if(void 0===NF.BaseDataAccessHelper&&o.FormVariables.pageContextDefined)try{NWF$.getScript(_spPageContextInfo.siteAbsoluteUrl.replace(/sites.+/,"")+_spPageContextInfo.layoutsUrl+"/NintexForms/JavaScriptStringHandler.ashx?resourceType=jsfile&fileName=NF.BaseDataAccessHelper.js&culture="+_spPageContextInfo.currentCultureName)}catch(e){console.log(e)}outerDiv.outerHeight(outerDiv.height())}),NWF.FormFiller.Events.RegisterAfterReady(function(){outerDiv.data("outerDivHeight",outerDiv.height()),o.FormVariables.pageIsReady=!0}),window.onload=function(){"object"!=typeof RTE||document.body.spellcheck?NWF.FormFiller.Events.RegisterAfterReady(function(){NWF$("body").attr("spellcheck",!0)}):NWF$("body").attr("spellcheck",!0)},o}(NCU||{});