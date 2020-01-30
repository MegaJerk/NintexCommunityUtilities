# NintexCommunityUtilities
A tiny library of helpful functions for working with Nintex Classic Forms for SharePoint on Premise.

# Why!?
The code that Nintex Classic Forms is built upon has accumulated a lot of peculiar quirks and gotcha's over the years. Because not everybody wants to spend their time digging around JavaScript files in the hopes of figuring out just *why* their form explodes whenever they hide a Repeating Section, I have attempted build out this small utility that *should* fix some of the inherent problems left behind and offer a few functions that you can use to do things that might otherwise drive you mad.

The goal is to create a baseline experience that should work across most SharePoint / Nintex versions, and all browsers.

# What's In This?

### A Few Fixes

- For the Form incorrectly calculating its size whenever you show / hide a control or add / delete a new row
- For Repeating Sections destroying their Height whenever they are hidden
- For Controls inside of Repeating Sections that lose association to custom Validation Rules whenever a new Row is Added
- For when a Responsive Forms required library (NF) won't loading correctly in Classic Forms

### A Few New Variables

- **pageIsReady:** A boolean that is set to true once the form has entered what it considers to be its ready state
- **formType:** An object that can be used to determine if the form is in Edit, Display, New, or Preview Mode

### A Few New Functions

- **getControlValueByName:** Returns a jQuery object containing the control of the name you passed in (assuming it exists)
- **getControlByEval:** Returns a reference to a control if a Formula Reference (literally (with quotes): "{Control:Self}"} is passed into it. Mostly for advanced users who need to know which control they are currently evaluating during a rule's (Validation or Formatting) execution
- **getAssociatedLabelForControl:** Returns the first Label that has been associated to the passed Control (if an association is found)
- **getAssociatedControlForLabel:** Returns the associated Control of a given label (in ALL Form View Modes!!!)
- **getLabelText:** Returns a string of a given Label Control's text

### A Few Odds And Ends

- **pageIsValid:** Returns true if all of the Validation Rules pass or the form is in a non-editable mode type
- **RepositionAndResizeOtherControlsAndFillerContainerHeight**: A normalization reference to the Out-Of-Box (Nintex provided) function of the same name that was put into a different library after a particular version of Nintex Forms.

### And One Optional Toggle

- **To re-enable the browser's built-in spellcheck!!!** (*if you want it that is*)

# Outro
If you find any problems with this library, feel free to yell at me.
Any further libraries that I make for Nintex Classic Forms will most likely be built with this library in mind as a dependency (unless stated otherwise). 
Got a different question about Nintex? Why not come join the Nintex Community forums @ https://community.nintex.com/ 

Remember to test this in a safe environment before using it on your production servers! I take no responsibility for any destroyed Nintex Installations, SharePoint Explosions, or Database Collapses as a result of its use ;) ♥


