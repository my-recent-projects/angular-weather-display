import { Injectable } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import { IWeatherRequestParam } from '../shared/interfaces/i-weather-request-param';
import { environment } from '../shared/base-url/baseUrl';

@Injectable({
  providedIn: 'root'
})
export class WeathertService {

  _apiUrl: string = '';

  constructor() { 
    this._apiUrl = environment.apiUrl;
  }

  async GetWeatherInformation(requestParam: IWeatherRequestParam) {

    const weatherApiResponse = await fetchWeatherApi(this._apiUrl, requestParam);
    // const _weatherDetails = weatherApiResponse;
    return weatherApiResponse;
  }
}
