import React, { Component, createContext, useContext, useState } from "react";
import produce from "immer";
import "./App.css";
import { ReactNodeLike } from "prop-types";

type cICRet<T> = {
  StateProvider: ({ children }: { children: ReactNodeLike }) => JSX.Element;
  useImmutableContext: () => {
    state: T;
    dispatch: (update: (state: T) => void) => void;
  };
};

function createImmutableContext<T>(
  defaultState: T,
  onUpdate?: (state: T) => void
): cICRet<T> {
  const _Context = createContext(defaultState);
  const { Provider } = _Context;

  let state: T = defaultState;
  let setValue: ((state: T) => void) | null = null;

  function dispatch(updateFn: (state: T) => void) {
    if (state) {
      state = produce(state, updateFn);
      setValue && setValue(state);
      onUpdate && onUpdate(state);
    }
  }

  function StateProvider({ children }: { children: ReactNodeLike }) {
    const [value, setV] = useState(defaultState);
    state = value;
    setValue = setV;
    return <Provider value={value}>{children}</Provider>;
  }

  function useImmutableContext() {
    const state = useContext(_Context);

    return { state, dispatch };
  }

  return { StateProvider, useImmutableContext };
}

type ExampleType = {
  count: number;
  deeply: {
    nested: {
      thing: {
        like: number;
      };
    };
  };
};

const history: ExampleType[] = [];
const { StateProvider, useImmutableContext } = createImmutableContext<
  ExampleType
>(
  {
    count: 0,
    deeply: {
      nested: {
        thing: {
          like: 5
        }
      }
    }
  },
  s => {
    history.push(s);
    console.log(history);
  }
);

const CountThing = () => {
  const { dispatch, state } = useImmutableContext();

  return (
    <div>
      <p>{state.count}</p>
      <button
        onClick={() =>
          dispatch(s => {
            s.count++;
          })
        }
      >
        Hit me
      </button>
      <p>{state.deeply.nested.thing.like}</p>
    </div>
  );
};

const DeepDiveUpdate = () => {
  const { dispatch } = useImmutableContext();

  return (
    <div>
      <button
        onClick={() =>
          dispatch(s => {
            s.deeply.nested.thing.like--;
            s.count++;
          })
        }
      >
        Dive!
      </button>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <StateProvider>
        <CountThing />
        <CountThing />
        <DeepDiveUpdate />
      </StateProvider>
    );
  }
}

export default App;
