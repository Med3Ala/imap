import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject, Observable, from, fromEventPattern, take } from 'rxjs';
// import turf
import * as turf from '@turf/turf';

@Injectable({
  providedIn: 'root'
})
export class ShapeService {

  static map : BehaviorSubject<L.Map> = new BehaviorSubject<any>(undefined);
  static Shapes : BehaviorSubject<iShape[]> = new BehaviorSubject<iShape[]>([]);
  static clickObs : Observable<L.LeafletMouseEvent> = fromEventPattern<L.LeafletMouseEvent>(
    (handler) => {
      ShapeService.map.value.on('click', handler);
    },
    (handler) => {
      ShapeService.map.value.off('click', handler);
    }
  );
  constructor() { }
}



export class iShape {
  id: number;
  name: string;
  area: number;
  perimeter: number;
  coordinates: L.LatLng[];
  shape! : L.Layer;
  pins: L.Marker[] = [];

  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    this.id = id;
    this.name = name;
    this.area = area;
    this.perimeter = perimeter;
    this.coordinates = coordinates;
  }

  addPin(e: L.LatLng){
    this.coordinates.push(e);
    this.pins.push(L.marker(e,{ icon: pinicon }));
    this.pins[this.pins.length - 1].addTo(ShapeService.map.value!);
    console.log(this.coordinates);
  }
}

export class iCircle extends iShape {
  radius: number;

  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[], radius: number) {
    super(id, name, area, perimeter, coordinates);
    this.radius = radius;
  }

  draw(){
    console.log('Drawing circle');
    
    from(ShapeService.clickObs).pipe(
      take(2)
    ).subscribe({
      next: (e: L.LeafletMouseEvent) => {
        this.addPin(e.latlng);
      },
      complete: () => {
        this.shape = L.circle(this.coordinates[0], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5,
          radius : turf.distance(turf.point([this.coordinates[0].lng, this.coordinates[0].lat]), turf.point([this.coordinates[1].lng, this.coordinates[1].lat]), {units: 'kilometers'}) * 1000
        })
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
      }
    });

    // ShapeService.map.value?.on('click', (e: L.LeafletMouseEvent) => {
    //   console.log(e);
    // });
  }
}



let pinicon = L.divIcon({
  className: 'pin',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -20],
  html: '<div class="pin" style="padding: 5px;border-radius: 50px;background: #05ff00;width: 10px;height: 10px;"></div>'
})