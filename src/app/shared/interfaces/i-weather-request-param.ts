export interface IWeatherRequestParam {

    latitude: number,
    longitude: number,
    current: [
        "temperature_2m",
        "relative_humidity_2m",
        "rain",
        "wind_speed_10m"
    ],
    forecast_days: number
}
