import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShapesTableComponent } from './shapes-table/shapes-table.component';
import { iShapeContext } from 'projects/leaflet-i-shape/src/lib';
import { FilterModalComponent } from './filter-modal/filter-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  title = 'imap';

  constructor(
    private dialog: MatDialog
  ) { 

  }

  ngOnInit(): void {
    
  }

  openDialog() {
    const dialogRef = this.dialog.open(ShapesTableComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  
  openFilter() {
    const dialogRef = this.dialog.open(FilterModalComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  drawCircle() {
    iShapeContext.instance?.draw("circle");
  }
  drawRectangle() {
    iShapeContext.instance?.draw("rectangle");
  }
  drawPolygon() {
    iShapeContext.instance?.draw("polygon");
  }
  drawPath() {
    iShapeContext.instance?.draw("path");
  }
  drawMarker() {
    iShapeContext.instance?.draw("marker");
  }


}
