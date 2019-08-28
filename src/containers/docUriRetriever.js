import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import { traverse, registerTraversal, setTraversalObjectives, checkTraversalObjectives, scoreNextPageStatic, scorePrevPageStatic, fetchScore } from 'meld-clients-core/src/actions/index';
import Score from 'meld-clients-core/src/containers/score';


const MEIMIMETYPE = "application/x-mei";

const vrvOptions = {
	scale: 45,
  adjustPageHeight: 1,
	pageHeight: 1080,
	pageWidth: 2200,
	noFooter: 1,
	unit: 6
};

class DocUriRetriever extends Component {
  constructor(props) { 
    super(props);
    this.state = { 
      docUri: "",
      meiUri: "",
      traversalThreshold: 20
    }
    this.retrieveCEUri = this.retrieveCEUri.bind(this);
    this.processTraversalOutcomes = this.processTraversalOutcomes.bind(this);
    this.ensureArray = this.ensureArray.bind(this);
  }


  render() { 
    return(
      <div>
        Enter CE URI
        <div>
          <input value={this.state.docUri} onChange={ (evt) => this.setState({docUri: evt.target.value, meiUri:""}) } />
          <button onClick={this.retrieveCEUri}>Retrieve from CE</button>
        </div>
        <div>
          Result: <pre>{ JSON.stringify(this.props.graph.outcomes[0], null, 2) }</pre>
        </div>
        { this.state.meiUri
          ? <Score uri={ this.state.meiUri } key = { this.state.meiUri } options = { vrvOptions } />
          : <div>No MEI source currently specified.</div>
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
      numHops:1,
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

export default connect(mapStateToProps, mapDispatchToProps)(DocUriRetriever);
