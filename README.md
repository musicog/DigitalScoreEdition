# TROMPA Digital Score Edition (technical demo)

## Purpose: 
* Demonstrate retrieval and rendering of (externally hosted) score via CE references
* Demonstrate selection and annotation of score elements
* Demonstrate layout changes to score rendering

## To install:
`git clone https://github.com/trompamusic/DigitalScoreEdition`
`cd DigitalScoreEdition`
`npm install`
`npm start`


## To use:
* Go to `http://localhost:8080` in your browser
* Enter the URI of a DigitalDocument in the CE into the textbox. Click the Retrieve button.
* Once the score loads:
  * Click and drag to select elements. Ctrl+click and drag for multiple selections.
  * Toggle selection preferences to control the type of elements selected (`measures`, `notes`)
  * Click on empty space in score rendering to clear selection
* When a selection is active:
  * Note that the annotation controls appear. 
  * Use radio buttons to select a type of annotation (`highlighting`, `describing`, `linking`).
  * Use `Annotate` button to generate an annotation.
    * For describing, you will be prompted for a descriptive text.
    * For linking, you will be prompted for a URI.
* To change score layout, activate on `Show verovio options` checkbox
* In the resulting menu:
  * All layout options are listed with current values in editable  fields.
  * After editing, click `Update options` to reload score with new layout.
  * After editing, click `Reset options` to revert current edits.
  * Type into text field next to the two buttons to filter the layout options (e.g. try typing "note")


