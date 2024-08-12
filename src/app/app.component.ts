import { Component, OnInit } from '@angular/core';
import { ShapeService, iCircle, iPath, iPoly, iRect } from './shape.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'imap';

  constructor(private shapeService: ShapeService) { 

  }

  ngOnInit(): void {
    
  }

}
