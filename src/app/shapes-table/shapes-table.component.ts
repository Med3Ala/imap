import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { iShape, iShapeContext } from 'projects/leaflet-i-shape/src/lib';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-shapes-table',
  templateUrl: './shapes-table.component.html',
  styleUrls: ['./shapes-table.component.scss']
})
export class ShapesTableComponent implements OnInit {
  shapes = new ShapesDataSource();
  displayedColumns: string[] = ['name'];

  constructor() {

    iShapeContext.Shapes.subscribe(shapes => {
      console.log(shapes);
      this.shapes.setShapes(shapes);
    });
  }

  ngOnInit(): void {
    
  }
}


export class ShapesDataSource extends DataSource<iShape> {
  override disconnect(collectionViewer: CollectionViewer): void {
    throw new Error('Method not implemented.');
  }

  data = new BehaviorSubject<iShape[]>([]);

  connect(): Observable<iShape[]> {
    return this.data;
  }
  
  setShapes(shapes: iShape[]) {
    this.data.next(shapes);
  }
}