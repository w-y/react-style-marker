#React-style-marker

React-style-marker is trying to manage inline style on React elements in a different way. 

With React-style-marker, inline style will be converted into variables and expressions and you can reuse these variables in the same rule in this system.

- '+', '-', '*', '/', '=', '(', ')' instead of object operations
- bottom up and composable
- readable and reusable

## Installation

    npm install react-style-marker
    
## Usage

    var Marker = require('react-style-marker');
    var I = Marker.insert;
    var T = Marker.trans;
    
### Trans

Trans translates the react-style-marker string to react inline style object.

    <div style={T("width(100)+height(100)+display('block'))")} >
    </div>
    
Which is equal to 
    
    <div style={{width:100,height:100,display:block}}
    </div>

If it has an assign expression, the left side will be assigned value which is the result of the right side expression. 
        
    T('myDiv=display(block) + width(100) + heigh(100)')

Then you can simply use
    
    <div style={T('myDiv')}>
    </div>
    
Using ';' or '\n' to seperate Multiple expression:

    T('myDiv1=display(block) + width(100) + heigh(100);myDiv2=myDiv1')
        
    
### Insert

Parameters: alias, key, value, [priority, state](optional)
    
    I('myBg', 'background', 'grey');

Then you define style {myBg:background('grey')}

    <div style={T('myBg')}>
    </div>

You can also define style with state:
    
    I('myBgHover, 'background', 'red', 1, 'hover');

Using '*' to achive composing style with states:
    
    <button 
        style={T('myBg*myBgHover', this.state.hover)}
        onMouseEnter={this.handleMouseEnter} 
        onMouseLeave={this.handleMouseLeave} >
    </button>
    
    handleMouseEnter() {
      this.setState({
        hover: 'hover'
      });
    },
    handleMouseLeave() {
      this.setState({
        hover: null
      });
    },

### Examples with React

    var Marker = require('react-style-marker');
    var T = Marker.trans;

    // you can use custom variable cm as the combination
    // cm = Object.assign({}, {display:'absolute'}, {left:0} ...)
      
    T("cm=display('absolute')+left(0)+right(0)+top(0)+bottom(0)+margin('auto auto auto auto')");

    var Demo = React.createClass({
      render: function() {
        // Trans covert expression to react styles
        // And can use variables which you defined with Trans earlier(variable cm)
        return (
          <div>
            <div style={T("height(500)+relative+background('orange')")} >
              <div style={T("cm+width(50)+height(100)+background('green')")}>
              </div>
            </div>
          </div>
        )
      }
    });
    
    React.render(<Demo />, document.getElementById('example'));

Stateful styles:
    
    var Marker = require('react-style-marker');var I = Marker.insert;
    var T = Marker.trans;

    // Alias for a certain style
    I('bg', 'background', 'grey');
    I('bgHover', 'background', 'pink', 1, 'hover');

    var Demo = React.createClass({
      getInitialState() {
        return {
          hover: null
        };
      },
      handleMouseEnter() {
        this.setState({
          hover: 'hover'
        });
      },
      handleMouseLeave() {
        this.setState({
          hover: null
        });
      },
      // '*' make multiple state combined in a single variable
      // Trans has an optional sencond paramter state
      // Which can filter style value with certain state 
      render: function() {
        return (
         <div>
           <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} style={T("width(100)+height(100)+bg*bgHover", this.state.hover)}>
           </div>
         </div>
        )
      }
    });
    React.render(<Demo />, document.getElementById('example')); 


## Live Demo

<a href="https://jsbin.com/bigapexevi/1/edit?js,output" target="_blank">Simple hover</a>

<a href="https://jsbin.com/cejemuwuwi/1/edit?js,output" target="_blank">Align center middle with absolute block</a>

