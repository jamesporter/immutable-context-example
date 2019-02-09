import React from "react";
import createImmutableContext, {
  historyLogger,
  ICApply
} from "immutable-context";

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
  historyLogger()
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
    </div>
  );
};

// 5. App

const ToDoApp = () => (
  <StateProvider>
    <ToDoList />
  </StateProvider>
);

export default ToDoApp;
