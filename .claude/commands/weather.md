# /weather — Clima actual y pronóstico

Obtiene el clima actual, sensación térmica, humedad, viento, estado del cielo y pronóstico extendido de Valdivia, Chile usando Open-Meteo (API gratuita sin clave). También intenta wttr.in como alternativa.

## Instrucciones

Ejecuta en secuencia:

1. **Obtener datos actuales y pronóstico de Open-Meteo** (primaria — fiable, JSON directo):
   ```bash
   curl -s --max-time 20 "https://api.open-meteo.com/v1/forecast?latitude=-39.8142&longitude=-73.2459&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,precipitation&hourly=temperature_2m,weather_code,precipitation_probability,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max&timezone=America%2FSantiago&forecast_days=3"
   ```

2. **Si necesitas detalle horario o vista tipo texto**, obtener de wttr.in como fallback:
   ```bash
   curl -s --max-time 20 "wttr.in/Valdivia?lang=es&Q&T"
   ```

3. **Interpretar el código de clima WMO** y presentar al usuario:

   | Código | Condición | Emoji |
   |---|---|---|
   | 0 | Cielo despejado | ☀️/🌙 |
   | 1-3 | Principalmente despejado / nublado | 🌤️/⛅ |
   | 45,48 | Niebla | 🌫️ |
   | 51-55 | Llovizna | 🌦️ |
   | 61-65 | Lluvia | 🌧️ |
   | 66-67 | Lluvia con granizo | 🌨️ |
   | 71-75 | Nieve | ❄️ |
   | 80-82 | Chubascos | ⛈️ |
   | 95-99 | Tormenta | ⛈️🌩️ |

4. **Presentar la información al usuario**:
   - **Clima actual** en tabla: condición, temperatura, sensación térmica, humedad (%), viento (velocidad + dirección), visibilidad, presión, precipitación
   - **Pronóstico 3 días** en tablas: código WMO convertido a texto español con emoji, temp máx/mín, sensación térmica, precipitación total, velocidad del viento
   - **Resumen final** con recomendación práctica en una línea

5. Si ambas APIs fallan (>20s), informar que el servicio no está disponible y sugerir consultar wttr.in/Valdivia manualmente.

## Formato de salida recomendado

```
## 🌦️ Clima en Valdivia, Chile

### Condiciones actuales (actualizado)
| Campo | Valor |
|---|---|
| Condición | [emoji] [descripción] |
| Temperatura | XX °C |
| Sensación térmica | YY °C |
| Humedad | XX% |
| Viento | XX km/h [dirección] |
| Ráfagas | XX km/h |
| Visibilidad | ~XX m |
| Precipitación actual | X.X mm |
| Presión | XXX hPa |

### Pronóstico 3 días

#### [Día, DD] — [resumen en una frase con emoji]
| Momento | Temp máx/mín | Sensación térmica | Precip. total | Viento máx |
|---|---|---|---|---|
| Día | XX° / YY°C | ZZ°C | X.X mm | XX km/h |

[... repetir para cada día]

> 📌 Resumen: recomendación práctica en una línea.
```

## Dirección del viento (texto)

- 0-11 → Norte (↑)
- 12-34 → Noreste (↗)
- 35-56 → Este (→)
- 57-79 → Sureste (↘)
- 80-101 → Sur (↓)
- 102-124 → Suroeste (↙)
- 125-146 → Oeste (←)
- 147-169 → Noroeste (↖)
- 170-189 → Norte (↑)
- ... continuar cada 22°
