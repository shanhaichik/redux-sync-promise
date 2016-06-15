function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

const resolveProps = (obj, state, dispatch, params = {}) => {
  const props = Object.keys(obj);

  return Promise.all(props.map(prop => isPromise(obj[prop]) ? obj[prop] : obj[prop](state, dispatch, params))).then(resolvedArray => {
    return props.reduce((prev, prop, index) => {
      prev[prop] = resolvedArray[index];
      return prev;
    }, {});
  });
};

export function APISync(params) {
  const { pending, success, failure } = params.postfix || {};
  const { onPending, onSuccess, onError } = params || {};
  return ({ getState, dispatch }) => next => action => {

    if (!action.types) {
      return next(action);
    }

    let { data, types, ...actions } = action;
    let state = getState();

    let pendingType = pending ? `${types}_${pending}` : `${types}_PENDING`;
    let successType = success ? `${types}_${success}` : `${types}_SUCCESS`;
    let failureType = failure ? `${types}_${failure}` : `${types}_FAILURE`;

    let pendingAction = { type: pendingType, meta: data };
    let successAction = { type: successType };
    let failureAction = { type: failureType, meta: data };

    next(pendingAction);

    if (onPending && typeof onPending === 'function') {
      onPending(dispatch, data);
    }

    return resolveProps(actions, state, dispatch, data).then(
      results => {
        next({ ...successAction, ...results });
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(dispatch, results, data);
        }
      },
      error => {
        next({ ...failureAction, error: error.data.errors || error.data });
        if (onError && typeof onError === 'function') {
          onError(dispatch, error, data);
        }
      }
    );
  };
}
