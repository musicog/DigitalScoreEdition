import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import { traverse, registerTraversal, setTraversalObjectives, checkTraversalObjectives, scoreNextPageStatic, scorePrevPageStatic, fetchScore } from 'meld-clients-core/src/actions/index';
import ScoreOptionsWrapper from './scoreOptionsWrapper';
import SelectionPreferences from './selectionPreferences';
import DragSelect from "dragselect/dist/DragSelect";
import PropTypes from 'prop-types';

const MEIMIMETYPE = "application/x-mei";

class DigitalScoreEdition extends Component {
  constructor(props) { 
    super(props);
    this.state = { 
      docUri: "",
      meiUri: "",
      showOptions: false,
      traversalThreshold: 20
    }
    this.retrieveCEUri = this.retrieveCEUri.bind(this);
    this.processTraversalOutcomes = this.processTraversalOutcomes.bind(this);
    this.enableSelector = this.enableSelector.bind(this);
    this.handleSelectionPreferencesChange = this.handleSelectionPreferencesChange.bind(this);
    this.ensureArray = this.ensureArray.bind(this);
  }
  
  enableSelector() {
    console.log("in enableSelector");
    if(!Object.keys(this.props.score.SVG).length) {
      console.log("Oops")
      return; // no MEI loaded yet
    }
    if (typeof this.state.selector !== "undefined") {
      console.log("Stopping previous selector")
        this.state.selector.stop();
    }
    console.log("Configuring new selector")
    let selector = new DragSelect({
        selectables: document.querySelectorAll("g[class='note']"),
        area: document.getElementsByClassName('score')[0],
        selectedClass: 'selected',
        onDragStartBegin: () => {
          console.log("Trying to begin")
            document.body.classList.add('s-noselect');
        },
        callback: (elements) => {
            console.log("Trying to callback with ", elements)
            document.body.classList.remove('s-noselect');
            this.handleSelectionChange(elements);
        }
    });
    console.log("About to set selector: ", selector);
    this.setState({selector: selector});
  }


  render() { 
    console.log("MEI URI: ", this.state.meiUri)
    let showOptionsCheckbox = <span />;
    if(this.state.meiUri) { 
      showOptionsCheckbox = <span><input type="checkbox" name="showOptions" checked={this.state.showOptions} onChange={ () => this.setState({showOptions: !this.state.showOptions}) }/> Show Verovio options</span>;
    }
    return(
      <div>
        Enter CE URI
        <div>
          <input size="60" value={this.state.docUri} onChange={ (evt) => this.setState({docUri: evt.target.value, meiUri:""}) } />
          <button onClick={this.retrieveCEUri}>Retrieve</button> {showOptionsCheckbox}
        </div>
        { this.state.meiUri
          ? <div>
              <ScoreOptionsWrapper uri={ this.state.meiUri } showOptions={ this.state.showOptions }/>
              <SelectionPreferences preferences={ {} } settingsHandler={ this.handleSelectionPreferencesChange } />
            </div>
          : <div>Enter a CE DigitalDocument URI corresponding to an MEI file.</div>
        }

      </div>
    )
  }
    
  componentDidMount() { 
    this.props.setTraversalObjectives([
      { "@type": "https://schema.org/DigitalDocument" },
    ]);
  }
  componentDidUpdate(prevProps, prevState)  {
    // 1. Coordinate traversals
    if("traversalPool" in this.props &&  // if traversal pool reducer ready
      Object.keys(this.props.traversalPool.pool).length && // and a traversal is waiting in the pool
      this.props.traversalPool.running < this.state.traversalThreshold  // and we don't have too many
    ) {  
      // then start another traversal
      const nextTraversalUri = Object.keys(this.props.traversalPool.pool)[0];
      const nextTraversalParams = this.props.traversalPool.pool[nextTraversalUri];
      this.props.traverse(nextTraversalUri, nextTraversalParams);
    }
    // 2. Check traversal objectives after traversal completes
    if("traversalPool" in this.props && Object.keys(this.props.traversalPool.pool).length === 0 &&
      prevProps.traversalPool.running > 0 && this.props.traversalPool.running === 0) { 
      // finished all traversals
      this.setState({ "loading": false });
      console.log("Checking traversal objectives against outcomes:", this.props.graph.outcomes);
      this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
    }
    // 3. Process traversal outcomes
    if("graph" in prevProps) { 
      // check our traversal objectives if the graph has updated
      if(prevProps.graph.outcomesHash !== this.props.graph.outcomesHash) { 
        console.log("Attempting to process outcomes")
        // outcomes have changed, need to update our projections!
        this.processTraversalOutcomes();
      }
    }
  }
  
  ensureArray(val) { 
    return Array.isArray(val) ? val : [val]
  }

  handleSelectionPreferencesChange(settings) {
      this.setState({settings: settings}, () => {
          this.enableSelector();
      });
  }
  
  handleSelectionChange(selection) {
    this.setState({selection: selection}, () => {
        if (typeof this.props.selectionCallback === "function") {
            this.props.selectionCallback(selection);
        }
    });
  }

  processTraversalOutcomes() { 
    console.log("Processing outcomes: ", this.props.graph.outcomes[0]["@graph"])
    const meiDocuments = this.props.graph.outcomes[0]["@graph"].filter( (o) => { 
      return this.ensureArray(o["http://purl.org/dc/elements/1.1/format"]).includes(MEIMIMETYPE)
    }).map( (o) => { 
      return o["http://purl.org/dc/elements/1.1/source"]
    })
    // TODO rethink... for now, only take first MEI document found
    this.setState({ meiUri: meiDocuments[0] });
  }
  retrieveCEUri() { 
    this.props.registerTraversal(this.state.docUri, { 
      numHops:0,
      objectPrefixWhitelist:["http://localhost:4000"]
    })
    console.log("Retrieving ", this.state.docUri);
  }
}

function mapStateToProps({ score, graph, traversalPool }) {
  return { score, graph, traversalPool }
}

function mapDispatchToProps(dispatch) { 
  return bindActionCreators( { 
    fetchScore,
    traverse, 
    registerTraversal,
    setTraversalObjectives, 
    checkTraversalObjectives, 
    scoreNextPageStatic, 
    scorePrevPageStatic
    }, dispatch);
}

DigitalScoreEdition.propTypes = {
    scoreURL: PropTypes.string,
    showURLInput: PropTypes.bool,
    scoreSVG: PropTypes.string,
    selectionCallback: PropTypes.func,
    preferencesCallback: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(DigitalScoreEdition);
