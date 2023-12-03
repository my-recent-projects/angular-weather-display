import { Component, OnInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { ILocationCoordinates } from '../shared/interfaces/i-location';
import { catchError, first, map, take, throwError } from 'rxjs';
import { IWeatherRequestParam } from '../shared/interfaces/i-weather-request-param';
import { WeathertService } from '../services/weather-forecast.service';
import { ICurrentWeather } from '../shared/interfaces/i-current-weather';
@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  private userLocation: ILocationCoordinates;
  private weatherRequestParameters: IWeatherRequestParam;
  currentWeather: ICurrentWeather;
  private _geoLocationError: any;
  private _latitude: number = 0;
  private _longitude: number = 0;

  _userGeoLocation: any;
  _error: any;

  constructor(private readonly geoLocationService$: GeolocationService, private weatherService: WeathertService) { 
    
    //initialize gealocation coordinates [Lat & Long]
    this.userLocation = {
      latitude: 0,
      longitude: 0
    } 

    //initialize http request parameters
    this.weatherRequestParameters = {
      latitude: 0,
      longitude: 0,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "rain",
        "wind_speed_10m"
      ],
      forecast_days: 0
    }

    //initialize http response parameters
    this.currentWeather = {

      latitude: 0,
      longitude: 0,
      generationtime_ms: 0,
      utc_offset_seconds: 0,
      time_zone: "",
      timezone_abbreviation: "",
      elevation: 0,
      current_units: {
        time: "iso8601",
        interval: "seconds",
        temperature_2m: "°C",
        relative_humidity_2m: "%",
        is_day: "",
        rain: "mm",
        wind_speed_10m: "km/h"
      },
      current: {
        time: "",
        interval: 0,
        temperature_2m: 0,
        relative_humidity_2m: 0,
        is_day: 0,
        rain: 0,
        wind_speed_10m: 0
      }
    }

  }

  //initialize the component
  ngOnInit(): void {

    let locCoordinates = this.GetCurrentUserLocation();
    if ((locCoordinates.latitude > 0) || (locCoordinates.latitude > 0)) {
      this.GetCurrentWeather();
    }
  
  }

  //request current user geolocation
  private GetCurrentUserLocation(){

    this.geoLocationService$.pipe(
      first(),
       map((_userGeolocation: any) => {
         if (!_userGeolocation) {
           throwError;
         }
         return _userGeolocation; 
       }),
       catchError(geoLocationError => {
         throw geoLocationError;
       })
     )
    .subscribe({
      next: (_userGeoLocation) => {

          //set detected location coordinates
          this.userLocation = {
          latitude: _userGeoLocation.coords.latitude,
          longitude: _userGeoLocation.coords.longitude
          }
        console.log('==== PRINTING HERE =====')
        console.log(this.userLocation);
        
        this.GetCurrentWeather();
      },
      error: (_geoLocationError: Error) => {

        this._geoLocationError = _geoLocationError;
        this.ErrorHandler(this._geoLocationError);
      }

    })
   
    return this.userLocation; 
  }

  async GetCurrentWeather() {

    let weatherParams = this.SetWeatherRequestParameters;
    
    const _weatherApiResponse = await this.weatherService.GetWeatherInformation(weatherParams);
    const _weatherDetails = _weatherApiResponse[0];
    const _currentWeather = _weatherDetails.current()!;

      this.currentWeather = {

        latitude: _weatherDetails.latitude(),
        longitude: _weatherDetails.longitude(),
        generationtime_ms: _weatherDetails.generationTimeMilliseconds(),
        utc_offset_seconds: _weatherDetails.utcOffsetSeconds(),
        time_zone: _weatherDetails?.timezone()!,
        timezone_abbreviation: _weatherDetails.timezoneAbbreviation()!,
        elevation: _weatherDetails.elevation(),

        current_units: {
          time: "iso8601",
          interval: "seconds",
          temperature_2m: "°C",
          relative_humidity_2m: "%",
          is_day: "",
          rain: "mm",
          wind_speed_10m: "km/h"
        },
        current: {
          time: new Date((Number(_currentWeather.time()) + _weatherDetails.utcOffsetSeconds()) * 1000).toString(),
          interval: _currentWeather.variables(1)!.value(),
          temperature_2m: _currentWeather.variables(0)!.value(),

          //correct
          relative_humidity_2m: _currentWeather.variables(1)!.value(),

          is_day: _currentWeather.variables(6)!.value(),

          //correct
          rain: _currentWeather.variables(2)!.value(),
          //correct
          wind_speed_10m: _currentWeather.variables(3)!.value()
        }

      }
  
    return this.currentWeather;
      
  }

  private get SetWeatherRequestParameters() {

    this.weatherRequestParameters = {
      latitude: this.Latitude,
      longitude: this.Longitude,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "rain",
        "wind_speed_10m"
      ],
      forecast_days: 1
    }; 

    return this.weatherRequestParameters;
  }

  //get geoLocation latitude
  get Latitude() {
    this._latitude = this.userLocation?.latitude;
    return this._latitude;
  }

  //get geoLocation longitude
  get Longitude() {
    this._longitude = this.userLocation?.longitude;
    return this._longitude;
  }

  //get current system date
  get CurrentDate() {
    let currentDate = new Date()
    return currentDate;
  }

  //handle geoLocation errors
  private ErrorHandler(_geoError: Error) {
    this._error = _geoError;
    console.log("=== GeoLocation error encountered ====")
    console.log(_geoError);
  }

  private WeatherErrorHandler(_weatherRequestError: Error) {
    
  }



}


