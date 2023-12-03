import { Component, NgModule ,OnInit } from '@angular/core';
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
  currentWeatherTemperature: number = 0;
  currentWeatherTemperatureUnit: string = "";
  _selectedUnitOption: number = 1;
  _httpResponseError: string = '';

  private _geoLocationError: any;
  private _latitude: number = 0;
  private _longitude: number = 0;

  _userGeoLocation: any;
  _error: any;

  temperatureUnits = [
    { id: 1, name: 'Celsius', checked: true },
    { id: 2, name: 'Fahrenheit', checked: false }
  ];

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
    this.GetCurrentUserLocation();
    this.GetCurrentWeather();
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
        console.log('==== Location detected =====')
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

  //get geoLocation latitude
  get Latitude() {
    return this.userLocation?.latitude;
  }

  //get geoLocation longitude
  get Longitude() {
    return this.userLocation?.longitude;
  }

  //set all required http parameters
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

  async GetCurrentWeather() {

    let weatherParams = this.SetWeatherRequestParameters;
    
    try {
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

      //set updated temperature units
      this.ChangeTemperatureUnit(this._selectedUnitOption);
      
    } catch (e) {
                if (e) {
                  this.WeatherErrorHandler(e);
                }
    }

    return this.currentWeather;
      
  }

  
  //Toggle temperature units [ °C vs °F ]
  ChangeTemperatureUnit(_selectedUnitOption: number) {

    //convert from °C to °F and its unit symbol
    if (_selectedUnitOption == 2) {
      this.currentWeatherTemperature = this.currentWeather.current.temperature_2m * 9.0 / 5.0 + 32;
      this.currentWeatherTemperatureUnit = "°F";
      
    } else {
      //Asign °C value and its unit symbol
      this.currentWeatherTemperature = this.currentWeather.current.temperature_2m;
      this.currentWeatherTemperatureUnit = this.currentWeather.current_units.temperature_2m;
    }
  }

  
  //get current system date
  get CurrentDate() {
    let currentDate = new Date()
    return currentDate;
  }

  //handle geoLocation errors
  private ErrorHandler(_geoError: Error) {
    this._error = _geoError;
    console.log(_geoError);
  }

  //Handling server error
  private WeatherErrorHandler(_weatherRequestError: any) {
    this._httpResponseError = "Loading weather information failed! "
  }



}


