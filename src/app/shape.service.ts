import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject, Observable, from, fromEventPattern, skip, take, takeUntil, takeWhile } from 'rxjs';
// import turf
import * as turf from '@turf/turf';

@Injectable({
  providedIn: 'root'
})
export class ShapeService {
  
  constructor() { }
}