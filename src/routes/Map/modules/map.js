// ------------------------------------
// Services
// ------------------------------------
const geoJsonTransformer = (coordinates) => ({
  geomatory: {
    coordinates: coordinates,
    type: 'Point'
  },
  properties: {

  }
})

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
export const ADD_POINT_TO_LINE = 'ADD_POINT_TO_LINE'
export const LOADING_START = 'LOADING_START'
export const LOADING_STOP = 'LOADING_STOP'

// ------------------------------------
// Actions
// ------------------------------------
export function initISSPosition() {
  return function (dispatch) {
    dispatch({type : 'LOADING_START'})
    return fetch(`http://api.open-notify.org/iss-now.json`).then((response) => {
      response.json().then(json => {

        if(json.message === 'success') {
          dispatch({ type: MAP_ADD_MARKER, payload: [parseFloat(json.iss_position.latitude), parseFloat(json.iss_position.longitude)] })
          dispatch({ type: 'ADD_POINT_TO_LINE', payload: [parseFloat(json.iss_position.longitude), parseFloat(json.iss_position.latitude)] })
          dispatch({type : 'LOADING_STOP'})
        } else console.log(json)
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


export function whenWillPassThroughYou(c) {
  return function (dispatch) {
    return fetch(`http://api.open-notify.org/iss-pass.json?lat=${c.lat}&lon=${c.long}`, { mode: 'cors' })
      .then((response) => {
        response.json().then(json => {
          dispatch({ type: SAVE_WHEN_WILL_PASS_THROUGH, payload: json })
        })
      }).catch(error => {
        throw(error);
      })
  }
}

export function togglePeopleInfo() {
  return {
    type: TOGGLE_PEOPLE_INFO
  }
}
export function togglePassInfo() {
  return {
    type: TOGGLE_PASS_INFO
  }
}

export function toggleBasemap(basemap) {
  return {
    type: TOGGLE_BASEMAP,
    payload: basemap
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [MAP_ADD_MARKER]: (state, action) => Object.assign({}, state, { position: action.payload }),
  [UPDATE_PEOPLE_IN_SPACE]: (state, action) => Object.assign({}, state, { people: action.payload }),
  [SAVE_WHEN_WILL_PASS_THROUGH]: (state, action) => Object.assign({}, state, { pass: action.payload }),
  [TOGGLE_PASS_INFO]: (state, action) => Object.assign({}, state, { info: { pass: !state.info.pass, people: state.info.people } }),
  [TOGGLE_PEOPLE_INFO]: (state, action) => Object.assign({}, state, { info: { people: !state.info.people, pass: state.info.pass } }),
  [TOGGLE_BASEMAP]: (state, action) => Object.assign({}, state, { basemap: action.payload }),
  [ADD_POINT_TO_LINE]: (state, action) => Object.assign({}, state, { line: state.line.concat([action.payload])}),
  [LOADING_START] : (state,action) => Object.assign({}, state, { loading: true }),
  [LOADING_STOP] : (state,action) => Object.assign({}, state, { loading: false })
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loading : false,
  position: [0, 0],
  info: {
    people: true,
    pass: true
  },
  basemap: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  line: [
    [0,0]
  ]
}

export default function counterReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
