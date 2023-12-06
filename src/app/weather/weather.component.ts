import { Component, NgModule ,OnInit, OnDestroy } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { ILocationCoordinates } from '../shared/interfaces/i-location';
import { catchError, first, map, take, throwError } from 'rxjs';
import { IWeatherRequestParam } from '../shared/interfaces/i-weather-request-param';
import { WeathertService } from '../shared/services/weather-forecast.service';
import { ICurrentWeather } from '../shared/interfaces/i-current-weather';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
  
export class WeatherComponent implements OnInit, OnDestroy {

  private _userLocation: ILocationCoordinates;
  _geoLocationError: any;
  private _latitude: number = 0;
  private _longitude: number = 0;
  _userGeoLocationOb: any;
  _error: any;
  
  private _weatherRequestParameters: IWeatherRequestParam;
  _currentWeather: ICurrentWeather;
  _currentWeatherTemperature: number = 0;
  _currentWeatherTemperatureUnit: string = "";
  _selectedUnitOption: number = 1;
  _httpResponseError: string = '';
  
  _temperatureUnits = [
    { id: 1, name: 'Celsius', checked: true },
    { id: 2, name: 'Fahrenheit', checked: false }
  ];

  constructor(private readonly geoLocationService$: GeolocationService, private weatherService: WeathertService) { 
    
    //initialize gealocation coordinates [Lat & Long]
    this._userLocation = {
      latitude: 0,
      longitude: 0
    } 

    //initialize http request parameters
    this._weatherRequestParameters = {
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
    this._currentWeather = {

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
  }

  //request current user geolocation
  private GetCurrentUserLocation(){

    this._userGeoLocationOb = this.geoLocationService$.pipe(
      take(1),
      // first(),
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
          this._userLocation = {
          latitude: _userGeoLocation.coords.latitude,
          longitude: _userGeoLocation.coords.longitude
          }
        console.log('==== geoLocation detected =====')
        console.log(this._userLocation);
        
        this.GetCurrentWeather();
      },
      error: (_Error: Error) => {
        this.GeoLocationErrorHandler(_Error);
        console.log('==== geoLocation Error detected =====')
        console.log(_Error);
      }
    })
   
    return this._userLocation; 
  }

  //get geoLocation latitude
  get Latitude() {
    return this._userLocation?.latitude;
  }

  //get geoLocation longitude
  get Longitude() {
    return this._userLocation?.longitude;
  }

  //set all required http parameters
  private get SetWeatherRequestParameters() {

    this._weatherRequestParameters = {
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

    return this._weatherRequestParameters;
  }

  //retrieve weather information of the provided geoLocation
  private async GetCurrentWeather() {

    let weatherParams = this.SetWeatherRequestParameters;
    
    try {
      const _weatherApiResponse = await this.weatherService.GetWeatherInformation(weatherParams);
      const _weatherDetails = _weatherApiResponse[0];
      const _currentWeather = _weatherDetails.current()!;

      this._currentWeather = {
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
          //map values as per indexes
          temperature_2m: _currentWeather.variables(0)!.value(),
          relative_humidity_2m: _currentWeather.variables(1)!.value(),
          is_day: _currentWeather.variables(6)!.value(),
          rain: _currentWeather.variables(2)!.value(),
          wind_speed_10m: _currentWeather.variables(3)!.value(),
          
          //not being dispalyed in the template
          interval: _currentWeather.variables(4)!.value(),
        }
      }
      
      console.log('==== HTTP response data [Weather]')
      console.log(this._currentWeather);

      //set updated temperature units
      this.ChangeTemperatureUnit(this._selectedUnitOption);
 
    } catch (e) {
      if (e) {
        
        console.log('==== HTTP response error detected ')
        console.log(e);

        this.WeatherErrorHandler(e);
      }
    }

    

    return this._currentWeather;
      
  }

  //Toggle temperature units [ °C vs °F ]
  ChangeTemperatureUnit(_selectedUnitOption: number) {

    //convert from Celsius to Fahrenheit and its unit symbol [°C to °F ]
    if (_selectedUnitOption == 2) {
      this._currentWeatherTemperature = this._currentWeather.current.temperature_2m * 9.0 / 5.0 + 32;
      this._currentWeatherTemperatureUnit = "°F";
      
    } else {
      //Keep the value and its unit as Celsius [°C]
      this._currentWeatherTemperature = this._currentWeather.current.temperature_2m;
      this._currentWeatherTemperatureUnit = this._currentWeather.current_units.temperature_2m;
    }
  }

  //get current system date
  get CurrentDate() {
    let _currentDate = new Date()
    return _currentDate;
  }

  //handle geoLocation errors
  private GeoLocationErrorHandler(_Error: Error) {
    this._geoLocationError = _Error;
  }

  //Handling server error
  private WeatherErrorHandler(_weatherRequestError: any) {
    this._httpResponseError = "Loading weather information failed! "
  }

  ngOnDestroy() {
    this._userGeoLocationOb.unsubscribe();
    console.log('_userGeoLocationOb unsubscribed!');
  }

}


