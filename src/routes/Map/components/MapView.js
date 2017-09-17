import React, { Component } from 'react'
import { Map, Marker, Popup, TileLayer, FeatureGroup, GeoJSON} from 'react-leaflet';
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

  layerMount (gl, id, metadata) {
    if (!gl) return
    // window.layers[id] = gl.leafletElement
    // Set layers in Indra Store
    // this.props.indraStore.getIndraStore().layers[id] = gl.leafletElement
    // Bring CENTERLINE to BACK of All layers
    if (id === 'CL') gl.leafletElement.bringToBack()
    // If METADATA is Not DEFINED POPUP WON't be Shown (eg. CENTERLINE)
    if (metadata) {
      gl.leafletElement.eachLayer(c => {
        c.bindPopup(TooltipBuilder(metadata, c.feature.properties), { className: 'tooltip-styles', maxWidth:500 })
      })
    }

    gl.leafletElement.eachLayer(c => {
      if (c.feature.geometry.type !== 'LineString') {
        c.feature.properties.ImgUrl && c.setIcon(L.icon({
          iconUrl: c.feature.properties.ImgUrl,
          iconSize: [20, 20],
          shadowSize: [0, 0]
        }))
        c.feature.properties.divIcon && c.setIcon(L.divIcon({
          html: c.feature.properties.divIcon,
          iconSize: [10, 10]
        }))
      }

      if (c.feature.geometry.type === 'LineString') {
        if (c.feature.properties.FeatureColour) c.setStyle({ color:c.feature.properties.FeatureColour || metadata.defaultFeatureColour, stroke:2, opacity:1 })
      }
    })
    /*
    The Logic below is used for zoom based Label Show, defining symbology according to zoom level
    */
    // this.leafletMap.on('zoom', function (e) {
    //   if (e.target._zoom > 16) {
    //     gl.leafletElement.eachLayer(c => {
    //       if (c.feature.geometry.type === 'Point') {
    //         c.feature.properties.ImgUrl && c.setIcon(L.divIcon({
    //           html: `<img src=${c.feature.properties.ImgUrl} height='20px' width='20px' align='center'/><p>${c.feature.properties.JointNumber}</p>`, //eslint-disable-line
    //           iconSize: [20, 20]
    //         }))
    //       } else {
    //         c.bindTooltip(LabelBuilder(metadata, c.feature.properties))
    //       }
    //     })
    //   }
    //
    //   if (e.target._zoom < 16) {
    //     gl.leafletElement.eachLayer(c => {
    //       if (c.feature.geometry.type === 'Point') {
    //         c.feature.properties.ImgUrl && c.setIcon(L.icon({
    //           iconUrl: c.feature.properties.ImgUrl,
    //           iconSize: [20, 20],
    //           shadowSize: [0, 0]
    //         }))
    //       } else {
    //         c.unbindTooltip()
    //       }
    //     })
    //   }
    // })
  }

  // featureGroup (fg) {
  //   if (!fg) return
  //   window.featureGroup = fg.leafletElement
  //   this.leafletFeatureGroup = fg.leafletElement
  //   // this.leafletMap.fitBounds(this.leafletFeatureGroup.getBounds())
  //   this.leafletFeatureGroup.on('layeradd', () => this.leafletMap.fitBounds(this.leafletFeatureGroup.getBounds()))
  //   this.leafletFeatureGroup.on('layerremove',
  //     () => this.props.layers.filter(x => x.on).length &&
  //     this.leafletMap.fitBounds(this.leafletFeatureGroup.getBounds())
  //   )
  // }

  render() {
    let layer = {"type": "FeatureCollection",
    "features": [
      {
      "type": "Feature",
      "properties": {

      },
      "geometry": {
        "type": "LineString",
        "coordinates": this.props.map.line
      }
    }]}
    // console.log(this.props.map.line);
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
        <Map center={[0,0]} style={{'height' : '100vh'}} zoom={2}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url={this.props.map.basemap}
          />
          <FeatureGroup color='yellow'>
            {this.props.map.loading && <GeoJSON data={layer}
             />}
          </FeatureGroup>
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
