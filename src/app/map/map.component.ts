import { AfterViewInit, Component } from '@angular/core';

import * as L from 'leaflet';
import { iShapeContext } from 'projects/leaflet-i-shape/src/lib/iShapeContext';
// import { ShapeService, iCircle, iShape, iRect, iPoly, iPath } from '../shape.service';

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
    //private shapeService: ShapeService
  ) { 

  }


  ngAfterViewInit(): void {
    this.initMap();
    iShapeContext.getInstance(this.map);
    // ShapeService.map.next(this.map);
    // ShapeService.Shapes.subscribe((shapes) => {
    //   shapes.forEach((s:iShape)=>{
    //     s.shape.addTo(this.map);
    //   })
    // })


    //new iCircle(1, 'Circle', 0, 0, [], 0).draw();
    //new iRect(1, 'Rect', 100, 40, []).draw();
    //new iPoly(1, 'Poly', 0, 0, []).draw();
    //new iPath(1, 'Path', 0, 0, []).draw();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 53.370590, -8.032674 ],
      zoom: 7
    });

    this.tiles.addTo(this.map);
  }
}
