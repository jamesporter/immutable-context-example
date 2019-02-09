import React from "react";
import Basics from "./examples/Basics";
import ToDoApp from "./examples/ToDo";

const App = () => (
  <div className="apps">
    <div className="app">
      <Basics />
    </div>

    <div className="app">
      <ToDoApp />
    </div>
  </div>
);

export default App;
