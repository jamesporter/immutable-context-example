import React from "react";
import createImmutableContext from "immutable-context";

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

const App = () => (
  <StateProvider>
    <CountThing />
    <CountThing />
    <DeepDiveUpdate />
  </StateProvider>
);

export default App;
