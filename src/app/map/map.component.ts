import { AfterViewInit, Component } from '@angular/core';

import * as L from 'leaflet';
import { ShapeService, iCircle, iShape, iSquare } from '../shape.service';

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

  constructor(private shapeService: ShapeService) { 

  }


  ngAfterViewInit(): void {
    this.initMap();
    ShapeService.map.next(this.map);
    ShapeService.Shapes.subscribe((shapes) => {
      shapes.forEach((s:iShape)=>{
        s.shape.addTo(this.map);
        console.log(s)
      })
    })
    //new iCircle(1, 'Circle', 0, 0, [], 0).draw();
    new iSquare(1, 'Square', 100, 40, [], 10).draw();

  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 53.370590, -8.032674 ],
      zoom: 7
    });

    this.tiles.addTo(this.map);
  }
}
