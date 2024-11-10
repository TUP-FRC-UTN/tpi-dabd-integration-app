import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{
    description: string;
    icon: string;
  }];
  dt_txt?: string;
}

interface ForecastData {
  list: WeatherData[];
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const weatherTranslations: { [key: string]: string } = {
  'clear sky': 'Cielo despejado',
  'few clouds': 'Pocas nubes',
  'scattered clouds': 'Nubes dispersas',
  'broken clouds': 'Nublado parcial',
  'shower rain': 'Lluvia fuerte',
  'rain': 'Lluvia',
  'thunderstorm': 'Tormenta eléctrica',
  'snow': 'Nieve',
  'mist': 'Neblina',
  'overcast clouds': 'Nublado total',
  'light rain': 'Lluvia ligera'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  userName = 'Juan';
  weather: WeatherData | null = null;
  forecast: WeatherData[] = [];

  announcements: Announcement[] = [
    {
      id: 1,
      title: 'Mantenimiento Programado',
      content: 'El próximo sábado se realizará mantenimiento en las áreas comunes.',
      date: '2024-03-15',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Nueva Área Verde',
      content: 'Se ha inaugurado un nuevo espacio verde para el esparcimiento familiar.',
      date: '2024-03-10',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Actualización de Normativa',
      content: 'Se han actualizado las normativas de uso de instalaciones deportivas.',
      date: '2024-03-05',
      priority: 'low'
    }
  ];

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getWeather();
    this.getForecast();
  }

  getWeather() {
    const apiKey = '19f297409130d09871fbdbf5922cfae5';
    const city = 'Cordoba,AR';

    this.http.get<WeatherData>(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    ).subscribe(
      data => {
        this.weather = data;
        if (this.weather && this.weather.weather[0]) {
          this.weather.weather[0].description =
            weatherTranslations[this.weather.weather[0].description.toLowerCase()] ||
            this.weather.weather[0].description;
        }
      },
      error => console.error('Error fetching weather data', error)
    );
  }

  getForecast() {
    const apiKey = '19f297409130d09871fbdbf5922cfae5';
    const city = 'Cordoba,AR';

    this.http.get<ForecastData>(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    ).subscribe(
      data => {
        const dailyForecasts = data.list.reduce((acc: WeatherData[], curr) => {
          const date = new Date(curr.dt_txt || '').toLocaleDateString();
          if (!acc.find(item => new Date(item.dt_txt || '').toLocaleDateString() === date)) {
            // Traducir la descripción
            if (curr.weather[0]) {
              curr.weather[0].description =
                weatherTranslations[curr.weather[0].description.toLowerCase()] ||
                curr.weather[0].description;
            }
            acc.push(curr);
          }
          return acc;
        }, []);

        this.forecast = dailyForecasts.slice(1, 3);
      },
      error => console.error('Error fetching forecast data', error)
    );
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  }
}