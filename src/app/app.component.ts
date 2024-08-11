import { Component, OnInit } from '@angular/core';
import { ShapeService, iCircle, iPath, iPoly, iRect } from './shape.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'imap';
  cmdString = "";

  constructor(private shapeService: ShapeService) { 

  }

  ngOnInit(): void {
    document.addEventListener('keydown', (e) => {
      this.cmdString += e.key;
      this.runCommand();
    })
  }

  runCommand(){
    if(this.cmdString.includes('polygon')){
      this.cmdString = "";
      new iPoly(1, 'Poly', 0, 0, []).draw();
    }
    if(this.cmdString.includes('circle')){
      this.cmdString = "";
      new iCircle(1, 'Circle', 0, 0, [], 0).draw();
    }
    if(this.cmdString.includes('rectangle')){
      this.cmdString = "";
      new iRect(1, 'Rect', 100, 40, []).draw();
    }
    if(this.cmdString.includes('path')){
      this.cmdString = "";
      new iPath(1, 'Path', 0, 0, []).draw();
    }
    if(this.cmdString.includes('pins')){
      this.cmdString = "";
      ShapeService.Shapes.value.forEach((s) => {
        s.togglePin();
      });
    }
  }
}
