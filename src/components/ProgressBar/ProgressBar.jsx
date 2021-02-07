import React from "react";

const ProgressBar = (props) => {
    const { bgcolor, completed, inProgressText, completeText } = props;
  
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

    var percentText = ""
    if (completed === 100) {
      percentText = completeText
    } else if (completed > 25) {
      percentText = `${inProgressText} ${completed}%`
    } else {
      percentText = `${completed}%`
    }
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}>
          <span style={labelStyles}>{percentText}</span>
        </div>
      </div>
    );
  };
  
  export default ProgressBar;