import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import Score from 'meld-clients-core/src/containers/score';

const defaultOptions = {
    scale: 45,
    adjustPageHeight: 1,
    pageHeight: 2500,
    pageWidth: 2200,
    noFooter: 1,
    unit: 6
}

class ScoreOptionsWrapper extends Component {
  constructor(props) { 
    super(props);
    this.state = {
      vrvOptions: defaultOptions,
      menuOptions: defaultOptions
    }
    this.updateMenuOption = this.updateMenuOption.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) { 
    if("score" in prevProps 
        && !(this.props.uri in prevProps.score.MEI) 
        && this.props.uri in this.props.score.MEI) { 
      const vrvOptions = this.props.score.vrvTk.getOptions()
      console.log("Setting vrvOptions: ", vrvOptions)
      this.setState({
        vrvOptions: vrvOptions,
        menuOptions: vrvOptions,
        optionsFilter: ""
      })
    }
  }


  render() { 
    let options = {} 
    const optionsClass = this.props.showOptions ? "scoreOptionsWrapper" : "scoreOptionsWrapper hidden";
    return(
      <div>
          <div className={ optionsClass }>
            <button onClick={ () => this.setState({vrvOptions: this.state.menuOptions}) }>Update options</button>
            <button onClick={ () => this.setState({menuOptions: this.state.vrvOptions}) }>Reset options</button>
            <input type="text" name="optionsFilter" value={this.state.optionsFilter} onChange={(evt) => this.setState({optionsFilter: evt.target.value})}/>
            <div className="scoreOptions"> 
              { 
                Object.entries(this.state.menuOptions).sort().filter( ([k, v]) => { 
                   let filterString = this.state.optionsFilter || "";
                   filterString = filterString.toLowerCase();
                   return k.toLowerCase().indexOf(filterString) >= 0;
                }).map( ([k, v]) => {
                  let vInput;
                  if(typeof(v) === "boolean") { 
                    vInput = <input type="checkbox" name={k} checked={v} onChange={this.updateMenuOption} />
                  } else { 
                    vInput = <input type="text" name={k} value={v} onChange={this.updateMenuOption} />
                  }
                  return(
                    <div className="scoreOptionsEntry" key={k}> 
                      <span className="scoreOptionsKey"> {k} </span>
                      <span className="scoreOptionsValue">{vInput} </span>
                    </div>
                  )
                }) 
              }
            </div>
          </div>
        <Score uri={ this.props.uri } key = { this.props.uri } options = { this.state.vrvOptions } />
      </div>
    )
  }

  updateMenuOption(evt) { 
    console.log(evt.target.name, ":", evt.target.value, "-", evt.target.type);
    this.setState({
      menuOptions: {
        ...this.state.menuOptions,
        // force textboxes to use booleans (instead of "" or "on")
        [evt.target.name]: evt.target.type === "checkbox" ? !this.state.menuOptions[evt.target.name] : evt.target.value
      }
    })
  }
}

function mapStateToProps({ score }) {
  return { score }
}

function mapDispatchToProps(dispatch) { 
  return bindActionCreators( { 
    }, dispatch);
}

export default connect(mapStateToProps,)(ScoreOptionsWrapper);
