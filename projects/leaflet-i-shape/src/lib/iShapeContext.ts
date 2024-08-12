import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { BehaviorSubject, Observable, from, fromEventPattern, skip, take, takeUntil, takeWhile } from 'rxjs';


export class iShapeContext {
    static instance : iShapeContext | null = null;
    private map: L.Map;

    static Shapes : BehaviorSubject<iShape[]> = new BehaviorSubject<iShape[]>([]);
    static clickObs : Observable<L.LeafletMouseEvent>;

    private constructor(map: L.Map) {
        this.map = map;

        iShapeContext.clickObs = fromEventPattern<L.LeafletMouseEvent>(
            (handler) => {
              this.map.on('click', handler);
            },
            (handler) => {
              this.map.off('click', handler);
            }
          );

        iShapeContext.Shapes.subscribe((shapes) => {
            shapes.forEach((s:iShape)=>{
              s.shape.addTo(this.map);
            })
        });

        iShapeCli(this);
    }

    static getInstance(map: L.Map) {
        if (this.instance == null) {
            this.instance = new iShapeContext(map);
        }
        return this.instance;
    }

    static getMap() {
        return this.instance?.map;
    }

    addShape(shape: iShape){
        iShapeContext.Shapes.next([...iShapeContext.Shapes.value, shape]);
    }

    getShapes(){
        return iShapeContext.Shapes.value;
    }

    draw(type: string) : iShape{
        let shape : iShape;
        switch(type){
            case 'polygon':
                shape = new iPoly(iShapeContext.Shapes.value.length, 'Poly', 0, 0, []);
                break;
            case 'circle':
                shape = new iCircle(iShapeContext.Shapes.value.length, 'Circle', 0, 0, [], 0);
                break;
            case 'rectangle':
                shape = new iRect(iShapeContext.Shapes.value.length, 'Rect', 100, 40, []);
                break;
            case 'path':
                shape = new iPath(iShapeContext.Shapes.value.length, 'Path', 0, 0, []);
                break;
            case 'marker':
                shape = new iMarker(iShapeContext.Shapes.value.length, 'Marker', 0, 0, []);
                break;
            default:
                shape = new iPoly(iShapeContext.Shapes.value.length, 'Poly', 0, 0, []);
        }
        shape.draw();
        return shape;
    }
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
      this.pins[this.pins.length - 1].addTo(iShapeContext.getMap()!);
    }
  
    togglePin(show? : boolean){
  
      if(show != undefined)
        this.isVisiblePin = show;
      else
        this.isVisiblePin = !this.isVisiblePin;
  
      this.pins.forEach((p) => {
        if(this.isVisiblePin){
          p.addTo(iShapeContext.getMap()!);
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
        this.shape.addTo(iShapeContext.getMap()!);
        this.pins.forEach((p) => {
          p.addTo(iShapeContext.getMap()!);
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
      iShapeContext.Shapes.next(iShapeContext.Shapes.value.filter((s) => s.id != this.id));
    }
}
  
export class iPath extends iShape {
  constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
    super(id, name, area, perimeter, coordinates);
  }

  override draw(){
    console.log('Drawing Path');
    let finished = false;

    from(iShapeContext.clickObs).pipe(take(1)).subscribe(e=>{
      this.addPin(e.latlng);
      this.pins[0].bindPopup("click me to finish drawing", {closeOnClick:false}).openPopup()
      this.pins[0].on('click', ()=>{
        finished = true;
        this.shape = L.polyline(this.coordinates, {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5
        });
        this.shape.on("dblclick", ()=>{this.toggleEdit()})
        iShapeContext.Shapes.next([...iShapeContext.Shapes.value, this]);
        this.refreshData();
        this.enableDragging();
      })
    })

    from(iShapeContext.clickObs).pipe(
      skip(1),
      takeWhile(() => !finished)
    ).subscribe(e=>{
      this.addPin(e.latlng);
    });
  }

  refreshData(){
    this.perimeter = turf.length(turf.lineString(this.coordinates.map((c) => [c.lng, c.lat])), {units: 'kilometers'}) * 1000;
    this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
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

    from(iShapeContext.clickObs).pipe(take(1)).subscribe(e=>{
      this.addPin(e.latlng);
      this.pins[0].bindPopup("click me to finish drawing", {closeOnClick:false}).openPopup()
      this.pins[0].on('click', ()=>{
        finished = true;
        this.shape = L.polygon(this.coordinates, {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.5
        });
        this.shape.on("dblclick", ()=>{this.toggleEdit()})
        iShapeContext.Shapes.next([...iShapeContext.Shapes.value, this]);
        this.enableDragging();
        this.refreshData();
      })
    })

    from(iShapeContext.clickObs).pipe(
      skip(1),
      takeWhile(() => !finished)
    ).subscribe(e=>{
      this.addPin(e.latlng);
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = turf.area(turf.polygon([
      [...this.coordinates.map(
        (c) => [c.lng, c.lat]
      ), [this.coordinates[0].lng, this.coordinates[0].lat] as any]
    ]));
    this.perimeter = turf.length(turf.lineString(this.coordinates.map((c) => [c.lng, c.lat])), {units: 'kilometers'}) * 1000;
    this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
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
    from(iShapeContext.clickObs).pipe(
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
        this.shape.on("dblclick", ()=>{this.toggleEdit()})
        iShapeContext.Shapes.next([...iShapeContext.Shapes.value, this]);
        this.refreshData();
        this.enableDragging();
      }
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = this.length * this.width;
    this.perimeter = 2 * (this.length + this.width);
    this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
  }

  enableDragging(){
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
    
    from(iShapeContext.clickObs).pipe(
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
        this.shape.on("dblclick", ()=>{this.toggleEdit()})
        iShapeContext.Shapes.next([...iShapeContext.Shapes.value, this]);
        this.refreshData();
        this.enableDragging();
      }
    });
  }

  refreshData(){
    // reclaculate area and perimeter
    this.area = Math.PI * Math.pow(this.radius, 2);
    this.perimeter = 2 * Math.PI * this.radius;
    this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
  }

  enableDragging(){
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

export class iMarker extends iShape {
    constructor(id: number, name: string, area: number, perimeter: number, coordinates: L.LatLng[]) {
      super(id, name, area, perimeter, coordinates);
    }
  
    override draw(){
      console.log('Drawing Marker');
      from(iShapeContext.clickObs).pipe(
        take(1)
      ).subscribe({
        next: (e: L.LeafletMouseEvent) => {
          this.addPin(e.latlng);
          this.shape = this.pins[0];
          this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
          this.pins[0].dragging?.enable();
          iShapeContext.Shapes.next([...iShapeContext.Shapes.value, this]);
        }
      });
    }
  
    refreshData(){
      // reclaculate area and perimeter
      this.area = 0;
      this.perimeter = 0;
      this.shape.bindPopup(`Name : ${this.name} --- ID : ${this.id}<br>Area :${this.area}<br>Perimeter : ${this.perimeter}`)
    }
  
    enableDragging(){
      this.pins[0].on('drag', (e) => {
        this.coordinates[0] = this.pins[0].getLatLng();
        (this.shape as L.Marker).setLatLng(this.coordinates[0]);
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


function iShapeCli(context : iShapeContext){

  var cmdString = "";
  
  document.addEventListener('keydown', (e) => {
    cmdString += e.key;
    runCommand();
  })
  
  var runCommand = () => {
    if(cmdString.includes('polygon')){
      console.log("%cexcuting command : polygon", "color: green")
      cmdString = "";
      new iPoly(iShapeContext.Shapes.value.length, 'Poly', 0, 0, []).draw();
    }
    if(cmdString.includes('circle')){
      console.log("%cexcuting command : circle", "color: green")
      cmdString = "";
      new iCircle(iShapeContext.Shapes.value.length, 'Circle', 0, 0, [], 0).draw();
    }
    if(cmdString.includes('rectangle')){
      console.log("%cexcuting command : rectangle", "color: green")
      cmdString = "";
      new iRect(iShapeContext.Shapes.value.length, 'Rect', 100, 40, []).draw();
    }
    if(cmdString.includes('path')){
      console.log("%cexcuting command : path", "color: green")
      cmdString = "";
      new iPath(iShapeContext.Shapes.value.length, 'Path', 0, 0, []).draw();
    }
    if(cmdString.includes('pins')){
      console.log("%cexcuting command : pins", "color: green")
      cmdString = "";
      context.getShapes().forEach((s) => {
        s.togglePin();
      });
    }
    if(cmdString.includes('edit')){
      console.log("%cexcuting command : edit", "color: green")
      cmdString = "";
      context.getShapes().forEach((s) => {
        s.toggleEdit();
      })
    }
    if(cmdString.includes('hide')){
      console.log("%cexcuting command : hide", "color: green")
      cmdString = "";
      context.getShapes().forEach((s) => {
        s.toggleVisibility(false);
      })
    }
    if(cmdString.includes('show')){
      console.log("%cexcuting command : show", "color: green")
      cmdString = "";
      context.getShapes().forEach((s) => {
        s.toggleVisibility(true);
      })
    }
    if(cmdString.includes('clean') || cmdString.includes('clear')){
      console.log("%cexcuting command : clean", "color: green")
      cmdString = "";
      context.getShapes().forEach((s) => {
        s.delete();
      })
    }
  }
}