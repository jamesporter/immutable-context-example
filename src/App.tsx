import React from "react";
import Basics from "./examples/Basics";
import ToDoApp from "./examples/ToDo";
import ToDoAppWithUndo from "./examples/ToDoWithUndo";

const App = () => (
  <div className="apps">
    <div className="app">
      <Basics />
    </div>

    <div className="app">
      <ToDoApp />
    </div>

    <div className="app">
      <ToDoAppWithUndo />
    </div>
  </div>
);

export default App;
