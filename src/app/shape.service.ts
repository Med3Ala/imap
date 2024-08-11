import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject, Observable, from, fromEventPattern, skip, take, takeUntil, takeWhile } from 'rxjs';
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
  isVisiblePin: boolean = true;

  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    this.id = id;
    this.name = name;
    this.area = area;
    this.perimeter = perimeter;
    this.coordinates = coordinates;
  }

  draw(){
    console.log('Drawing Shape');
  }

  addPin(e: L.LatLng){
    this.coordinates.push(e);
    this.pins.push(L.marker(e,{ icon: pinicon }));
    this.pins[this.pins.length - 1].addTo(ShapeService.map.value!);
    console.log(this.coordinates);
  }

  togglePin(show? : boolean){

    if(show != undefined)
      this.isVisiblePin = show;
    else
      this.isVisiblePin = !this.isVisiblePin;

    this.pins.forEach((p) => {
      if(this.isVisiblePin){
        p.addTo(ShapeService.map.value!);
      }else{
        p.remove();
      }
    });
  }
}

export class iPath extends iShape {
  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    super(id, name, area, perimeter, coordinates);
  }

  override draw(){
    console.log('Drawing Path');
    let finished = false;

    from(ShapeService.clickObs).pipe(take(1)).subscribe(e=>{
      this.addPin(e.latlng);
      this.pins[0].bindPopup("click me to finish drawing", {closeOnClick:false}).openPopup()
      this.pins[0].on('click', ()=>{
        finished = true;
        this.shape = L.polyline(this.coordinates, {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5
        });
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
      })
    })

    from(ShapeService.clickObs).pipe(
      skip(1),
      takeWhile(() => !finished)
    ).subscribe(e=>{
      this.addPin(e.latlng);
    });
  }

  refreshData(){
    this.perimeter = turf.length(turf.lineString(this.coordinates.map((c) => [c.lng, c.lat])), {units: 'kilometers'}) * 1000;
  }
}

export class iPoly extends iShape {
  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    super(id, name, area, perimeter, coordinates);
  }

  override draw(){
    console.log('Drawing Poly');
    let finished = false;

    from(ShapeService.clickObs).pipe(take(1)).subscribe(e=>{
      this.addPin(e.latlng);
      this.pins[0].bindPopup("click me to finish drawing", {closeOnClick:false}).openPopup()
      this.pins[0].on('click', ()=>{
        finished = true;
        this.shape = L.polygon(this.coordinates, {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5
        });
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
      })
    })

    from(ShapeService.clickObs).pipe(
      skip(1),
      takeWhile(() => !finished)
    ).subscribe(e=>{
      this.addPin(e.latlng);
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = turf.area(turf.polygon([this.coordinates.map((c) => [c.lng, c.lat])]));
    this.perimeter = turf.length(turf.lineString(this.coordinates.map((c) => [c.lng, c.lat])), {units: 'kilometers'}) * 1000;
  }
}

export class iRect extends iShape {
  length: number;
  width: number;

  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    super(id, name, area, perimeter, coordinates);
    this.length = 0;
    this.width = 0;
  }

  override draw(){
    console.log('Drawing Rect');
    from(ShapeService.clickObs).pipe(
      take(2)
    ).subscribe({
      next: (e: L.LeafletMouseEvent) => {
        this.addPin(e.latlng);
      },
      complete: () => {
        this.width = turf.distance(turf.point([this.coordinates[0].lng, this.coordinates[0].lat]), turf.point([this.coordinates[1].lng, this.coordinates[0].lat]), {units: 'kilometers'}) * 1000;
        this.length = turf.distance(turf.point([this.coordinates[0].lng, this.coordinates[0].lat]), turf.point([this.coordinates[0].lng, this.coordinates[1].lat]), {units: 'kilometers'}) * 1000;
        this.shape = L.polygon([
          [this.coordinates[0].lat, this.coordinates[0].lng],
          [this.coordinates[1].lat, this.coordinates[0].lng],
          [this.coordinates[1].lat, this.coordinates[1].lng],
          [this.coordinates[0].lat, this.coordinates[1].lng],
        ], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5
        });
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
      }
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = this.length * this.width;
    this.perimeter = 2 * (this.length + this.width);
  }
}

export class iCircle extends iShape {
  radius: number;

  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[], radius: number) {
    super(id, name, area, perimeter, coordinates);
    this.radius = radius;
  }

  override draw(){
    console.log('Drawing circle');
    
    from(ShapeService.clickObs).pipe(
      take(2)
    ).subscribe({
      next: (e: L.LeafletMouseEvent) => {
        this.addPin(e.latlng);
      },
      complete: () => {
        this.radius = turf.distance(turf.point([this.coordinates[0].lng, this.coordinates[0].lat]), turf.point([this.coordinates[1].lng, this.coordinates[1].lat]), {units: 'kilometers'}) * 1000;
        this.shape = L.circle(this.coordinates[0], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5,
          radius : this.radius
        })
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
      }
    });

    // ShapeService.map.value?.on('click', (e: L.LeafletMouseEvent) => {
    //   console.log(e);
    // });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = Math.PI * Math.pow(this.radius, 2);
    this.perimeter = 2 * Math.PI * this.radius;
  }
}



let pinicon = L.divIcon({
  className: 'pin',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -20],
  html: '<div class="pin" style="padding: 5px;border-radius: 50px;background: #05ff00;width: 10px;height: 10px;"></div>'
})