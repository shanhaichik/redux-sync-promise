function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

const resolveProps = (obj, state, dispatch, params = {}) => {
  const props = Object.keys(obj);

  return Promise.all(props.map(prop => isPromise(obj[prop]) ? obj[prop] : obj[prop](state, dispatch, params)))
  .then(resolvedArray => {
    return props.reduce((prev, prop, index) => {
      prev[prop] = resolvedArray[index];
      return prev;
    }, {});
  });
};

const defaultOff = {
  pending: false,
  success: false,
  failure: false,
};

export function APISync(params) {
  const { pending, success, failure } = params.postfix || {};
  const { onPending, onSuccess, onError, off } = params || {};

  return ({ getState, dispatch }) => next => action => {

    if (!action.types) {
      return next(action);
    }

    const { data, types, ...actions } = action;
    const state = getState();

    const o = Object.assign({}, defaultOff, off, action.off);

    const pendingType = pending ? `${types}_${pending}` : `${types}_PENDING`;
    const successType = success ? `${types}_${success}` : `${types}_SUCCESS`;
    const failureType = failure ? `${types}_${failure}` : `${types}_FAILURE`;

    const pendingAction = { type: pendingType, meta: data };
    const successAction = { type: successType, meta: data };
    const failureAction = { type: failureType, meta: data };

    if (o.pending) {
      next(pendingAction);
      if (onPending && typeof onPending === 'function') {
        onPending(dispatch, data);
      }
    }

    return resolveProps(actions, state, dispatch, data).then(
      results => {
        if (o.success) {
          next({ ...successAction, ...results });
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(dispatch, results, data);
          }
        }
      },
      error => {
        if (o.failure) {
          next({ ...failureAction, error });
          if (onError && typeof onError === 'function') {
            onError(dispatch, error, data);
          }
        }
      }
    );
  };
}
