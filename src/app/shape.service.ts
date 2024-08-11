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
  isVisible: boolean = true;
  isVisiblePin: boolean = true;
  isEditable: boolean = false;

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

  toggleEdit(edit? : boolean){
    if(edit != undefined)
      this.isEditable = edit;
    else
      this.isEditable = !this.isEditable;

    this.pins.forEach((p) => {
      if(this.isEditable)
        p.dragging?.enable();
      else
        p.dragging?.disable();
    })
  }

  addPin(e: L.LatLng){
    this.coordinates.push(e);
    this.pins.push(L.marker(e,{ icon: pinicon }));
    this.pins[this.pins.length - 1].addTo(ShapeService.map.value!);
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

  toggleVisibility(visible? : boolean){
    if(visible != undefined)
      this.isVisible = visible;
    else
      this.isVisible = !this.isVisible;

    if(this.isVisible){
      this.shape.addTo(ShapeService.map.value!);
      this.pins.forEach((p) => {
        p.addTo(ShapeService.map.value!);
      });
    }else{
      this.shape.remove();
      this.pins.forEach((p) => {
        p.remove();
      });
    }
  }

  delete(){
    this.shape.remove();
    this.pins.forEach((p) => {
      p.remove();
    });
    ShapeService.Shapes.next(ShapeService.Shapes.value.filter((s) => s.id != this.id));
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
        this.shape.on("dblclick", ()=>{this.delete()})
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
        this.enableDragging();
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

  enableDragging(){
    this.pins.forEach((p,index) => {
      p.on('drag', (e) => {
        this.coordinates[index] = p.getLatLng();
        (this.shape as L.Polyline)?.setLatLngs(this.coordinates);
        this.refreshData();
      })
    })
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
        this.shape.on("dblclick", ()=>{this.delete()})
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.enableDragging();
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

  
  enableDragging(){
    this.pins.forEach((p,index) => {
      p.on('drag', (e) => {
        this.coordinates[index] = p.getLatLng();
        (this.shape as L.Polygon)?.setLatLngs(this.coordinates);
        this.refreshData();
      })
    })
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
        this.shape.on("dblclick", ()=>{this.delete()})
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
        this.enableDraggingg();
      }
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = this.length * this.width;
    this.perimeter = 2 * (this.length + this.width);
  }

  enableDraggingg(){
    var dragDot = (e: any, index : number) => {
      this.coordinates[index] = this.pins[index].getLatLng();
      (this.shape as L.Polygon)?.setLatLngs([
        [this.coordinates[0].lat, this.coordinates[0].lng],
        [this.coordinates[1].lat, this.coordinates[0].lng],
        [this.coordinates[1].lat, this.coordinates[1].lng],
        [this.coordinates[0].lat, this.coordinates[1].lng],
      ]);
      this.refreshData();
    }
    this.pins[0].on('drag', (e) => {dragDot(e, 0)});
    this.pins[1].on('drag', (e) => {dragDot(e, 1)});
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
        this.shape.on("dblclick", ()=>{this.delete()})
        ShapeService.Shapes.next([...ShapeService.Shapes.value, this]);
        this.refreshData();
        this.enableDraggingg();
      }
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = Math.PI * Math.pow(this.radius, 2);
    this.perimeter = 2 * Math.PI * this.radius;
  }

  enableDraggingg(){
    this.pins[0].on('drag', (e) => {
      (this.shape as L.CircleMarker ).setLatLng(this.pins[0].getLatLng());
    });
    this.pins[1].on('drag', (e) => {
      this.radius = turf.distance(turf.point([this.coordinates[0].lng, this.coordinates[0].lat]), turf.point([this.pins[1].getLatLng().lng, this.pins[1].getLatLng().lat]), {units: 'kilometers'}) * 1000;
      (this.shape as L.CircleMarker ).setRadius(this.radius);
      this.refreshData();
    });
  }
}



let pinicon = L.divIcon({
  className: 'pin',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -20],
  html: '<div class="pin" style="padding: 5px;border-radius: 50px;background: #05ff00;width: 10px;height: 10px;"></div>'
})