import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';

import { WeatherComponent } from './weather/weather.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { WeathertService } from './services/weather-forecast.service';

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule 
  ],
  providers: [WeathertService],
  bootstrap: [AppComponent]
})
export class AppModule { }
