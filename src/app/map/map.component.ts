import { AfterViewInit, Component } from '@angular/core';

import * as L from 'leaflet';
import { iShapeContext } from 'projects/leaflet-i-shape/src/lib/iShapeContext';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  
  tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  constructor(
    
  ) { 

  }


  ngAfterViewInit(): void {
    this.initMap();
    iShapeContext.getInstance(this.map);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 53.370590, -8.032674 ],
      zoom: 6
    });

    this.tiles.addTo(this.map);
  }
}
