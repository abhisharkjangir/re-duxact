// ------------------------------------
// Constants
// ------------------------------------
export const MAP_ADD_MARKER = 'MAP_ADD_MARKER'
export const MAP_UPDATE_MARKER = 'MAP_UPDATE_MARKER'
export const UPDATE_PEOPLE_IN_SPACE = 'UPDATE_PEOPLE_IN_SPACE'
export const SAVE_WHEN_WILL_PASS_THROUGH = 'SAVE_WHEN_WILL_PASS_THROUGH'
export const TOGGLE_PEOPLE_INFO = 'TOGGLE_PEOPLE_INFO'
export const TOGGLE_PASS_INFO = 'TOGGLE_PASS_INFO'
export const TOGGLE_BASEMAP = 'TOGGLE_BASEMAP'

// ------------------------------------
// Actions
// ------------------------------------
export function initISSPosition() {
  return function (dispatch) {
    return fetch(`http://api.open-notify.org/iss-now.json`).then((response) => {
      response.json().then(json => {
        if(json.message === 'success')
          dispatch({ type: MAP_ADD_MARKER, payload: [parseFloat(json.iss_position.latitude), parseFloat(json.iss_position.longitude)] })
        else console.log(json)
      })
    }).catch(error => {
      throw(error);
    })
  }
}

export function whoIsInSpace() {
  return function (dispatch) {
    return fetch(`http://api.open-notify.org/astros.json`).then((response) => {
      response.json().then(json => {
        if(json.message === 'success')
          dispatch({ type: UPDATE_PEOPLE_IN_SPACE, payload: json.people })
        else console.log(json)
      })
    }).catch(error => {
      throw(error);
    })
  }
}

export function whenWillPassThroughYou(coords) {
  return function (dispatch) {
    // let reqURL = {
    //   "message": "success",
    //   "request": {
    //     "altitude": 100,
    //     "datetime": 1505034416,
    //     "latitude": 26.9124336,
    //     "longitude": 75.7872709,
    //     "passes": 5
    //   },
    //   "response": [{
    //       "duration": 505,
    //       "risetime": 1505066500
    //     },
    //     {
    //       "duration": 631,
    //       "risetime": 1505072206
    //     },
    //     {
    //       "duration": 355,
    //       "risetime": 1505078174
    //     },
    //     {
    //       "duration": 435,
    //       "risetime": 1505095877
    //     },
    //     {
    //       "duration": 639,
    //       "risetime": 1505101592
    //     }
    //   ]
    // }
    // console.log(reqURL)
    // dispatch({ type: SAVE_WHEN_WILL_PASS_THROUGH, payload: reqURL })
    return fetch(`http://api.open-notify.org/iss-pass.json?lat=${coords.lat}&lon=${coords.long}&n=10`).then((response) => {
      response.json().then(json => {
        if(json.message === 'success')
        dispatch({ type: SAVE_WHEN_WILL_PASS_THROUGH, payload: json })
        else console.log(json);
      })
    }).catch(error => {
      throw(error);
    })
  }
}

export function togglePeopleInfo(){
  return {
    type : TOGGLE_PEOPLE_INFO
  }
}
export function togglePassInfo(){
  return {
    type : TOGGLE_PASS_INFO
  }
}

export function toggleBasemap(basemap){
  return {
    type : TOGGLE_BASEMAP,
    payload : basemap
  }
}


/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk! */

// export const initISSPosition = () => {
//   return (dispatch, getState) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         dispatch({
//           type    : COUNTER_DOUBLE_ASYNC,
//           payload : getState().counter
//         })
//         resolve()
//       }, 200)
//     })
//   }
// }

// export const actions = {
//   increment,
//   doubleAsync
// }

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [MAP_ADD_MARKER]: (state, action) => Object.assign({}, state, { position: action.payload }),
  [UPDATE_PEOPLE_IN_SPACE]: (state, action) => Object.assign({}, state, { people: action.payload }),
  [SAVE_WHEN_WILL_PASS_THROUGH]: (state, action) => Object.assign({}, state, { pass: action.payload }),
  [TOGGLE_PASS_INFO]: (state, action) => Object.assign({}, state, { info: {pass : !state.info.pass , people :state.info.people } }),
  [TOGGLE_PEOPLE_INFO]: (state, action) => Object.assign({}, state, { info: {people : !state.info.people , pass : state.info.pass} }),
  [TOGGLE_BASEMAP] : (state,action) => Object.assign({}, state, {basemap : action.payload})

}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  position: [28.448552, 77.072434],
  info: {
    people: true,
    pass: true
  },
  basemap: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
}

export default function counterReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
