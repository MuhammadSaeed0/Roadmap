# Integrate an external API through your backend

Your app should show the current weather for a city. The browser must not call the third-party API directly: the key would leak, the response format may change, and you want caching.

## Suggested structure

```
backend/  Api (WeatherController, Services/WeatherClient with HttpClientFactory, Options/WeatherOptions)
frontend/ src/app (weather/search, weather/forecast-card, core/weather-api)
```

## API contract

```http
GET /api/weather?city=Cairo   → 200 { city, temperature, description, updatedAt } | 400 | 404 | 503
(the backend calls a public weather API; the key, if any, lives in configuration)
```

## Your notes

- Decisions:
- Open questions:
