import { useRef } from "react";

type ArrayLike<G> = Array<unknown> & G;

export type DeepDerivedPropsCallback<R> = (prevProps: R, nextProps: R) => void;

/**
 * @description deepEqual one level
 */
export const deepEqual = <P>(prevValue: P, nextValue: P) => {
  const prevValueType = typeof prevValue;
  const nextValueType = typeof nextValue;
  if (prevValueType !== nextValueType) return false;
  if (typeof prevValue === "object") {
    if ((prevValue as any)?.constructor === Object) {
      if (Object.keys(prevValue).length !== Object.keys(nextValue).length)
        return false;
      for (const key in prevValue) {
        if (Object.prototype.hasOwnProperty.call(prevValue, key)) {
          if (!(key in nextValue)) return false;
          const prevFieldValue = prevValue[key];
          const nextFieldValue = nextValue[key];
          if (prevFieldValue !== nextFieldValue) return false;
        }
      }
    }

    return true;
    if (Array.isArray(prevValue) || Array.isArray(nextValue)) {
      if (!Array.isArray(nextValue) || !Array.isArray(prevValue)) return false;
      if (
        (prevValue as ArrayLike<P>).length !==
        (nextValue as ArrayLike<P>).length
      )
        return false;
      return (prevValue as ArrayLike<P>).some(
        (value, index) => value !== (nextValue as ArrayLike<P>)[index]
      );
    }
  }

  return prevValue === nextValue;
};

export const useDeepDerivedProps = <P>(
  cb: DeepDerivedPropsCallback<P>,
  props: P
) => {
  const prevProps = useRef<P>(props);
  if (!deepEqual(prevProps.current, props)) {
    cb(prevProps.current, props);
    prevProps.current = props;
  }
};
