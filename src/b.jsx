import React from "react";
import ReactDOM from "react-dom";
import "./style.scss";
function Box() {
  return (
    <div>
      box对22对对
      <Pox />
    </div>
  );
}

function Pox() {
  return <div>错所持</div>;
}

ReactDOM.render(<Box />, document.getElementById("root"));
