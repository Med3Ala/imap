import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShapesTableComponent } from './shapes-table/shapes-table.component';

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

}
