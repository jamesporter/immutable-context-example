import React from "react";
import createImmutableContext, {
  ICApply,
  ImmutableStateOptions
} from "immutable-context";

export function undoManager<T>(): {
  options: ImmutableStateOptions<T>;
  undo: () => void;
  redo: () => void;
  index: () => number;
  historySize: () => number;
} {
  let history: T[] = [];
  let index = -1;
  let setState: null | ((state: T) => void) = null;

  let appendToHistory = (state: T) => {
    index++;
    // blow away end of history if applicable i.e. don't preserve redos)
    history.splice(index);
    history.push(state);
    // TODO remove:
    console.log(history);
  };

  return {
    options: {
      onInitialize: appendToHistory,
      setSetState: setter => (setState = setter),
      onUpdate: appendToHistory
    },
    undo: () => {
      console.log("Undo", history, index);
      if (index > 0) {
        index--;
        setState && setState(history[index]);
      }
    },
    redo: () => {
      console.log("Redo", history, index);
      if (index < history.length - 1) {
        index++;
        setState!(history[index]);
      }
    },
    historySize: () => history.length,
    index: () => index
  };
}

// 1. Define types

type ToDo = {
  text: string;
  done: boolean;
};

type ToDoAppState = {
  pendingToDo: string;
  items: ToDo[];
};

// 2. call create immutable context:

const { undo, redo, historySize, index, options } = undoManager<ToDoAppState>();

console.log(historySize(), index());

const { StateProvider, useImmutableContext } = createImmutableContext<
  ToDoAppState
>(
  {
    pendingToDo: "",
    items: [
      {
        text: "Release new version of Immutable Context",
        done: false
      }
    ]
  },
  options
);

// 3. Updates

type TDApply = ICApply<ToDoAppState>;

const toggler = (apply: TDApply) => (i: number) => () =>
  apply((s: ToDoAppState) => {
    s.items[i].done = !s.items[i].done;
  });

const addToDo = (apply: TDApply) => () =>
  apply((s: ToDoAppState) => {
    if (s.pendingToDo.length > 0) {
      s.items.push({ text: s.pendingToDo, done: false });
      s.pendingToDo = "";
    }
  });

const updatePending = (apply: TDApply) => (text: string) =>
  apply((s: ToDoAppState) => {
    s.pendingToDo = text;
  });

const removeToDo = (apply: TDApply) => (i: number) => () =>
  apply((s: ToDoAppState) => {
    s.items.splice(i, 1);
  });

// 4. Components
const ToDoItem = ({
  text,
  done,
  toggleDone,
  remove
}: {
  text: string;
  done: boolean;
  toggleDone: () => void;
  remove: () => void;
}) => (
  <div className="item">
    <p>{text}</p>
    <input type="checkbox" defaultChecked={done} onChange={toggleDone} />
    <button onClick={remove}>Remove</button>
  </div>
);

const ToDoList = () => {
  const { apply, state } = useImmutableContext();
  const toggleDoneFor = toggler(apply);
  const remove = removeToDo(apply);
  const add = addToDo(apply);
  const update = updatePending(apply);

  return (
    <div>
      <input
        value={state.pendingToDo}
        onChange={evt => update(evt.target.value)}
      />
      <button onClick={add} disabled={state.pendingToDo.length === 0}>
        Add
      </button>
      {state.items.map((item, i) => (
        <ToDoItem
          key={i}
          text={item.text}
          done={item.done}
          toggleDone={toggleDoneFor(i)}
          remove={remove(i)}
        />
      ))}

      <div>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
    </div>
  );
};

// 5. App

const ToDoAppWithUndo = () => (
  <StateProvider>
    <ToDoList />
  </StateProvider>
);

export default ToDoAppWithUndo;
