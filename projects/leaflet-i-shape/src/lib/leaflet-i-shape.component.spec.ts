import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafletIShapeComponent } from './leaflet-i-shape.component';

describe('LeafletIShapeComponent', () => {
  let component: LeafletIShapeComponent;
  let fixture: ComponentFixture<LeafletIShapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeafletIShapeComponent]
    });
    fixture = TestBed.createComponent(LeafletIShapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
