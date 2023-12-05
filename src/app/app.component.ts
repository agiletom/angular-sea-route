import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Leaflet from 'leaflet';
import 'leaflet-ant-path';
import * as XLSX from 'xlsx';
import 'leaflet-control-geocoder';

const { AntPath } = require('leaflet-ant-path');

Leaflet.Icon.Default.imagePath = 'assets/';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
  options = {
    layers: [
        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      })
    ],
    zoom: 16,
    center: { lat: 28.626137, lng: 79.821603 }
  };
  data = [];

  constructor(private http: HttpClient) { }

  getDatafromCsv() {
    const url = 'assets/web_challenge.csv'; // Path to your file in the assets folder
    this.http.get(url, { responseType: 'arraybuffer' })
      .subscribe(data => {
        const csvCont = XLSX.read(data, { type: 'buffer' });
        const sheetNames = csvCont.SheetNames;

        if (sheetNames.length) {
          this.data = XLSX.utils.sheet_to_json(csvCont.Sheets[sheetNames[0]]);
        }
      });
  }

  initMarkers() {
    
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: data.draggable })
      .on('click', (event) => this.markerClicked(event, index))
      .on('dragend', (event) => this.markerDragEnd(event, index));
  }

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.getDatafromCsv();
    this.initMarkers();
  }

  mapClicked($event: any) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerClicked($event: any, index: number) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerDragEnd($event: any, index: number) {
    console.log($event.target.getLatLng());
  }

  getAddress(lat: number, lng: number) {
    const geocoder = (Leaflet.Control as any).Geocoder.nominatim();
    return new Promise((resolve, reject) => {
        geocoder.reverse(
            { lat, lng },
            this.map.getZoom(),
            (results: any) => results.length ? resolve(results[0].name) : reject(null)
        );
    })
  }
}
