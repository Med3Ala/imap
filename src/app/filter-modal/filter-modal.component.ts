import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import { iShape, iShapeContext } from 'projects/leaflet-i-shape/src/lib';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss']
})
export class FilterModalComponent {

  shapes : iShape[] = [];
  filters : any = {
    circles : true,
    rectangles : true,
    polygons : true,
    paths : true,
    markers : true
  }

  update(e : any, key : string) {
    this.filters[key] = e;
    console.log(this.filters)

    iShapeContext.Shapes.value.forEach(shape => {
      shape.categorie === key ? shape.toggleVisibility(this.filters[shape.categorie]) : null;
    })
  }
}