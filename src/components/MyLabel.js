import React from 'react';

function MyLabel({ text, fontSize, labelType }) {
  const divStyle = {
    fontSize: fontSize // This will apply the fontSize prop as the font size for the div
  };

  return (
    <div className={labelType} style={divStyle}>
      {text}
    </div>
  );
}

export default MyLabel;