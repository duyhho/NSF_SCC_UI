import React from "react";

const ProgressBar = (props) => {
    const { bgcolor, completed } = props;
  
    const containerStyles = {
      height: 20,
      width: "inherit",
      backgroundColor: "#e0e0de",
      borderRadius: 50,
      margin: 30,
      textAlign: 'left',
    }
  
    const fillerStyles = {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: bgcolor,
      borderRadius: 'inherit',
      textAlign: 'right',
      transition: 'width 1s ease-in-out',
      margin: 0,
    }
  
    const labelStyles = {
      padding: 5,
      color: 'white',
      fontWeight: 'bold'
    }

    var completeText = ""
    if (completed === 100) {
      completeText = `Stream Completed!`
    } else if (completed > 25) {
      completeText = `Streaming ${completed}%`
    } else {
      completeText = `${completed}%`
    }
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}>
          <span style={labelStyles}>{completeText}</span>
        </div>
      </div>
    );
  };
  
  export default ProgressBar;