import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { ShapesTableComponent } from './shapes-table/shapes-table.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CdkTableModule} from '@angular/cdk/table';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ShapesTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CdkTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
