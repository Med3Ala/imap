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
      console.log("%cexcuting command : polygon", "color: green")
      this.cmdString = "";
      new iPoly(1, 'Poly', 0, 0, []).draw();
    }
    if(this.cmdString.includes('circle')){
      console.log("%cexcuting command : circle", "color: green")
      this.cmdString = "";
      new iCircle(1, 'Circle', 0, 0, [], 0).draw();
    }
    if(this.cmdString.includes('rectangle')){
      console.log("%cexcuting command : rectangle", "color: green")
      this.cmdString = "";
      new iRect(1, 'Rect', 100, 40, []).draw();
    }
    if(this.cmdString.includes('path')){
      console.log("%cexcuting command : path", "color: green")
      this.cmdString = "";
      new iPath(1, 'Path', 0, 0, []).draw();
    }
    if(this.cmdString.includes('pins')){
      console.log("%cexcuting command : pins", "color: green")
      this.cmdString = "";
      ShapeService.Shapes.value.forEach((s) => {
        s.togglePin();
      });
    }
    if(this.cmdString.includes('edit')){
      console.log("%cexcuting command : edit", "color: green")
      this.cmdString = "";
      ShapeService.Shapes.value.forEach((s) => {
        s.toggleEdit();
      })
    }
    if(this.cmdString.includes('hide')){
      console.log("%cexcuting command : hide", "color: green")
      this.cmdString = "";
      ShapeService.Shapes.value.forEach((s) => {
        s.toggleVisibility(false);
      })
    }
    if(this.cmdString.includes('show')){
      console.log("%cexcuting command : show", "color: green")
      this.cmdString = "";
      ShapeService.Shapes.value.forEach((s) => {
        s.toggleVisibility(true);
      })
    }
  }
}
