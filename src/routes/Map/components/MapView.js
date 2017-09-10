import React, { Component } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import './Map.scss'
import SSicon from './ss.svg'
import locicon from './loc.svg'
import downArrow from './down.svg'
import rightArrow from './right.svg'
import Moment from 'moment'

window.moment = Moment;

const SSIcon = L.icon({
  iconUrl: SSicon,
  iconSize: [30, 30],
  className: 'marker-style'
})

const locIcon = L.icon({
  iconUrl: locicon,
  iconSize: [30, 30],
  className: 'marker-style'
})

const Basemaps = [
  {
    Name: 'Open Street Map',
    Url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  {
    Name: 'World Street',
    Url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
  },
  {
    Name: 'World Topology',
    Url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  },
  {
    Name: 'World Imagery',
    Url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }
];

const activeColor = {
  'color' : '#faec0b'
}

class MapView extends Component {
  constructor() {
    super()
  }

  componentDidMount() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.props.whenWillPassThroughYou({ lat: position.coords.latitude, long: position.coords.longitude })
      }, (err) => {
        console.log(err)
      })
    } else {
      console.log("Geolocation is not supported by this browser.  We're setting Sample geolocation.");
    }
    this.props.initISSPosition()
    this.props.whoIsInSpace()
    setInterval(this.props.initISSPosition, 5000)
  }

  render() {
    return(
      <div>
        <div className="basemap">
          <ul>
            {Basemaps.map((x,i) => <li key={i} className={x.Url===this.props.map.basemap?'hightlight':''} onClick={() =>this.props.toggleBasemap(x.Url)}>{x.Name} </li>)}
          </ul>
        </div>
        {this.props.map.people  &&
          <div className='people'>
            <p>Currently {this.props.map.people.length} people are in space.</p>
            <p className="close" onClick={this.props.togglePeopleInfo}>
              <img src={this.props.map.info.people?rightArrow:downArrow} width='20' height='20'/>
            </p>

            {this.props.map.info.people &&
              <div>
                <hr/>
                <ul>
                  {this.props.map.people.map((x ,i)=> <li key={x.name}>{i+1}. {x.name} - {x.craft}</li>)}
                </ul>
              </div>}
          </div>
        }

        {this.props.map.pass &&
          <div className='pass'>
            <p>According to your current location (Latitude : {this.props.map.pass.request.latitude} | Longitude : {this.props.map.pass.request.longitude}) international space station will pass through {this.props.map.pass.response.length} times.</p>
            <p className="close" onClick={this.props.togglePassInfo}>
              <img src={this.props.map.info.pass?rightArrow:downArrow} width='20' height='20'/>
            </p>
            {this.props.map.info.pass &&
              <div>
                <hr/><ul>
                  {this.props.map.pass.response.map((x,i) => <li key={x.risetime}>{i+1}. On {Moment.unix(x.risetime).format("Do MMMM YYYY HH:MM:SS A")}  in {x.duration} seconds.</li>)}
                </ul>
              </div>
            }
          </div>
        }
        <Map center={this.props.map.position} style={{'height' : '100vh'}} zoom={2}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url={this.props.map.basemap}
          />
          <Marker position={this.props.map.position} icon={SSIcon}>
            <Popup>
              <span>
                Latitude : {this.props.map.position[0]} <br/>
                Longitude : {this.props.map.position[1]}
              </span>
            </Popup>
          </Marker>
          {this.props.map.pass && <Marker position={[this.props.map.pass.request.latitude,this.props.map.pass.request.longitude]} icon={locIcon}>
            <Popup>
              <span>
                Latitude : {this.props.map.pass.request.latitude} <br/>
                Longitude : {this.props.map.pass.request.longitude}
              </span>
            </Popup>
          </Marker>}
        </Map>
      </div>
    )
  }
}

export default MapView
