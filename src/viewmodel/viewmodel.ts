import { useCallback, useEffect, useRef, useState } from "react";
import { deepCopy as clone } from "deep-copy-ts";

export type ActionType<P> = {
  payload: P;
};

export type Action<S, Payload = any> = (
  state: S,
  action: ActionType<Payload>
) => void;

export type Dispatcher<S> = (
  action: Action<S>
) => (payload: Parameters<typeof action>[1]["payload"]) => void;

export type EffectHandler<S, Exs, A, D extends unknown[] = []> = (utils: {
  state: S;
  actions: A;
  dispatch: Dispatcher<S>;
}) => {
  effect: () => void;
  deps: D;
};

export interface EffectBuilder<S, Exs, A, D extends unknown[] = []> {
  add: (effect: EffectHandler<S, Exs, A>, deps: D) => void;
}

export type StateType<S, P> = S | ((props?: P) => S);

export class EffectProvider<S, Exs, A, D extends unknown[] = []> {
  public effects: EffectHandler<S, Exs, A, D>[];
  constructor() {
    this.effects = [];
  }

  add(effect: EffectHandler<S, Exs, A, D>) {
    this.effects.push(effect);
  }
}

export interface IViewModel<S, Exs, P, A extends { [key: string]: Action<S> }> {
  state: StateType<S, P>;
  extraState?: Exs;
  actions?: A;
  effects?: (effectBuilder: EffectProvider<S, Exs, A>) => void;
}

export type ViewModelAction<S, A extends { [key: string]: Action<S> }> = {
  [key in keyof A]: Parameters<A[key]>[1] extends undefined
    ? () => void
    : (payload: Parameters<A[key]>[1]["payload"]) => void;
};

export class ViewModel<S, Exs, P, A extends { [key: string]: Action<S> }> {
  private viewModel: IViewModel<S, Exs, P, A>;
  private effectProvider: EffectProvider<S, Exs, A>;

  constructor(viewModel: IViewModel<S, Exs, P, A>) {
    this.viewModel = viewModel;

    const effectProvider = new EffectProvider<S, Exs, A>();
    this.effectProvider = effectProvider;

    if (viewModel.effects) {
      viewModel.effects(effectProvider);
    }
  }

  initializeState(props?: P): S {
    const { state: initialState } = this.viewModel;
    if (initialState instanceof Function) return initialState(props);

    return initialState;
  }

  initializeAction(dispatch: Dispatcher<S>) {
    const { actions = {} as A } = this.viewModel;
    const builderActions: ViewModelAction<S, A> = {} as ViewModelAction<S, A>;

    for (const actionName in actions) {
      const originAction = actions[actionName];
      builderActions[actionName] = ((
        payload: Parameters<typeof originAction>[1]["payload"]
      ) => {
        dispatch(originAction)({ payload });
      }) as ViewModelAction<S, A>[string];
    }
    return builderActions;
  }

  build() {
    const self = this;
    const { actions = {} as A } = self.viewModel;

    return (initialState?: P) => {
      const [, forceUpdate] = useState(0);
      const state = useRef<S>(self.initializeState(initialState));
      const cloneState = clone(state.current);

      const dispatch = useCallback((action: Action<S>) => {
        return (payload: Parameters<typeof action>[1]) => {
          action(state.current, payload);
          state.current = clone(state.current);
          forceUpdate((slot) => slot + 1);
        };
      }, []);

      const actionsBuilded = useRef<ViewModelAction<S, A>>(
        self.initializeAction(dispatch)
      ).current;

      self.effectProvider.effects.forEach((effectCreator) => {
        const { effect, deps } = effectCreator({
          state: cloneState,
          actions,
          dispatch,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
        return useEffect(effect, deps);
      });

      return {
        state: cloneState,
        actions: actionsBuilded,
      };
    };
  }
}

export default ViewModel;
