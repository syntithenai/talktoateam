import React from 'react'
import Autosuggest from 'react-autosuggest'

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


export default class TextDropdownComponent extends React.Component {
  constructor(props) {
    super();
    this.defaultOptions = props.defaultOptions ? Object.keys(props.defaultOptions).map(function(v) {return {name:v}}) : []
    console.log("CONSTR",props, this.defaultOptions)
	this.state = {
      value: props.value,
      suggestions: []
    };    
    this.onChangeCallback = props.onChange
  }

	componentWillReceiveProps(nextProps) {
	  // You don't have to do this check first, but it can help prevent an unneeded render
	  //if (nextProps.startTime !== this.state.startTime) {
	  console.log("UDPATE CATAUTOSUG PROPS",nextProps)
		if (nextProps.value) { 
		    let newState = {value: nextProps.value, suggestions: []}
			this.setState(newState);
		}
		this.defaultOptions = this.props.defaultOptions ? Object.keys(this.props.defaultOptions).map(function(v) {return {name:v}}) : []
	  //}
	}

	getSuggestions = value => {
	  const escapedValue = escapeRegexCharacters(value.trim());
	  
	  if (escapedValue === '') {
		return this.defaultOptions;
	  }

	  const regex = new RegExp('^' + escapedValue, 'i');
	  const suggestions = this.defaultOptions.filter(cat => regex.test(cat.name));
	  
	  if (suggestions.length === 0) {
		return [
		  { isAddNew: true }
		];
	  }
	  
	  return suggestions;
	}

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  getSuggestionValue = suggestion => {
    if (suggestion.isAddNew) {
      return this.state.value;
    }
    
    return suggestion.name;
  };

  renderSuggestion = suggestion => {
    if (suggestion.isAddNew) {
      return (
        <span>
          [+] Add new: <strong>{this.state.value}</strong>
        </span>
      );
    }

    return suggestion.name;
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: this.defaultOptions
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    if (suggestion.isAddNew) {
      console.log('Add new:', this.state.value);
      this.onChangeCallback(this.state.value)
    } else {
		this.onChangeCallback(suggestion.name.toLowerCase())
	}
    
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Search",
      value: value,
      onChange: this.onChange
    };

    return (
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        onSuggestionSelected={this.onSuggestionSelected}
        inputProps={inputProps} 
        shouldRenderSuggestions={function() {return true}}
      />
    );
  }
}
