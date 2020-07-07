import React from "react";
import ReactDOM from "react-dom";
import SearchBlock from "./SearchBlock.jsx";

export const init = (config, id) => {
  ReactDOM.render(<SearchBlock config={config} />, document.getElementById(id));
}
