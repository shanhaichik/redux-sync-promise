# redux-sync-promise

[![Build Status](https://travis-ci.org/shanhaichik/redux-sync-promise.svg?branch=master)](https://travis-ci.org/shanhaichik/redux-sync-promise)
[![NPM version][http://img.shields.io/npm/v/redux-sync-promise.svg]][https://npmjs.org/package/redux-sync-promise] [![Downloads][http://img.shields.io/npm/dm/redux-sync-promise.svg]][https://npmjs.org/package/redux-sync-promise] [![Dependency status][david-dm-image]][david-dm-url]
[![Coverage Status](https://coveralls.io/repos/github/shanhaichik/redux-sync-promise/badge.svg?branch=master)](https://coveralls.io/github/shanhaichik/redux-sync-promise?branch=master)

> Middleware for writing asynchronous actions in synchronous style

# Installation

```sh
$ npm install --save redux-sync-promise
```

# Usage
## Add middleware
```javascript
import { APISync } from 'redux-sync-promise';

const api = APISync({/* options */});
const createMiddleware = applyMiddleware(thunk, api);
const store = createMiddleware(createStore)(reducer);
```
## Action Examples
Every action will dispatch type name from types plus postfix.
```javascript
// This example will dispatch PEOPLE_PENDING, PEOPLE_SUCCESS or PEOPLE_FAILURE
/*
 * Full example
 * */
export function getPeopleList(contry, age) {
  return {
    types: 'PEOPLE',
    data: [contry, age], // this data will add in all functions like arguments
    name: getPeopleName,
    work: getPeopleWork
    food: getPeopleFood
  }
}

/*
 * Get people info
 * @param {object} state - store state
 * @param {function} dispatch - action dispatch function
 * @param {array} props - an array of props in the data key in the action
 * */
async function getPeopleName(state, dispatch, props) {
  let {people: {entriesOnPage}} = state;
  let _requestString = `investors/?rows=${entriesOnPage}`;

  const {data: {people, total}} = await fetch(_requestString);
  return {people, total};
}
// and so on ...

/*
 * Simple example
 * */
export function getUnicornList() {
  return {
    types: 'UNICORN',
    list: async (state, dispatch, props) => {
      let rainbow = await getRainbow();
      return rainbow.data.colors
    }
  }
}
// This example will dispatch UNICORN_PENDING, UNICORN_SUCCESS or UNICORN_FAILURE
```


## API
APISync exposes single constructor function for creating middleware.
> APISync( options: Object )

```javascript
// Full example
APISync({
	postfix: {
		pending: 'IS_PENDING',
		success: 'IS_SUCCESS'
		failure: 'IS_FAILURE'
	},
	onPending: (dispatch, data) => {
		console.log('some action api panding');
	},
	onSuccess: (dispatch, result, data) => {
		console.log('some action api success');
	},
	onError: (dispatch, error, data) => {
		// example use on errors
		if(err.status === 401)
	        dispatch({type: 'LOGOUT_SUCCESS'});

		console.log('some action api error');
	}
})
```
## postfix
Add your custom action type postfix for API call.
> Default: PENDING, SUCCESS, FAILURE

## onPending
Callback when actions in progress

## onSuccess
Callback on success

## onError 
Callback on error


## License

Copyright © 2016 [Alexander Dukhovnyak](https://github.com/shanhaichik)

Released under the MIT license. See [license](license) for details.
