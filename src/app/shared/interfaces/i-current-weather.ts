export interface ICurrentWeather {

    latitude: number,
    longitude: number,
    generationtime_ms: number,
    utc_offset_seconds: number,
    time_zone: string,
    timezone_abbreviation: string,
    elevation: number,
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
        time: string,
        interval: number,
        temperature_2m: number,
        relative_humidity_2m: number,
        is_day: number,
        rain: number,
        wind_speed_10m: number
    }

}
