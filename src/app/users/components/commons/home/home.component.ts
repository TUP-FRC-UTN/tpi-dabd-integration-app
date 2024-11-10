import { OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MainContainerComponent, TableComponent } from 'ngx-dabd-grupo01';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Notice, NoticeService } from '../../../services/notice.service';

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
  priority: 'high' | 'medium' | 'low';
  date?: string;
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
    HttpClientModule,
    MainContainerComponent,
    TableComponent,
    FormsModule,
    NgbPagination,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DatePipe],
})
export class HomeComponent implements OnInit {
  @ViewChild('announcementModal') announcementModal: any;
  @ViewChild('deleteModal') deleteModal: any;

  userName = 'Juan';
  weather: WeatherData | null = null;
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  forecast: WeatherData[] = [];
  announcements: Announcement[] = [];
  currentUserId = 1;
  
  announcementToDelete: Announcement | null = null;
  isEditing = false;
  newAnnouncement: Notice = {
    title: '',
    content: '',
    priority: 'MEDIUM',
    isActive: true,
    date: new Date().toISOString()
  };

  constructor(private http: HttpClient, private noticeService: NoticeService, private modalService: NgbModal) { }

  ngOnInit() {
    this.getWeather();
    this.getForecast();
    this.loadAnnouncements();
  }

  loadAnnouncements(isActive?: boolean) {
    this.noticeService.getAllNotices(0, 10, isActive).subscribe({
      next: (response) => {
        this.announcements = response.content;
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
      }
    });
  }

  filterAnnouncements(filter: 'all' | 'active' | 'inactive') {
    this.activeFilter = filter;
    switch (filter) {
      case 'active':
        this.loadAnnouncements(true);
        break;
      case 'inactive':
        this.loadAnnouncements(false);
        break;
      default:
        this.loadAnnouncements();
        break;
    }
  }


  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  editAnnouncement(announcement: Announcement) {
    this.noticeService.getNoticeById(announcement.id).subscribe({
      next: (notice) => {
        this.newAnnouncement = { ...notice };
        this.isEditing = true;
        this.openModal(this.announcementModal);
      },
      error: (error) => {
        console.error('Error loading announcement details:', error);
      }
    });
  }

  confirmDelete(announcement: Announcement) {
    this.announcementToDelete = announcement;
    this.modalService.open(this.deleteModal);
  }

  deleteAnnouncement() {
    if (this.announcementToDelete) {
      this.noticeService.softDeleteNotice(this.announcementToDelete.id, this.currentUserId)
        .subscribe({
          next: () => {
            this.modalService.dismissAll();
            this.loadAnnouncements();
            this.announcementToDelete = null;
          },
          error: (error) => {
            console.error('Error deleting announcement:', error);
          }
        });
    }
  }

  submitAnnouncement() {
    const operation = this.isEditing 
      ? this.noticeService.updateNotice(this.newAnnouncement, this.currentUserId)
      : this.noticeService.createNotice(this.newAnnouncement, this.currentUserId);

    operation.subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.loadAnnouncements();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving announcement:', error);
      }
    });
  }

  private resetForm() {
    this.newAnnouncement = {
      title: '',
      content: '',
      priority: 'MEDIUM',
      isActive: true,
      date: new Date().toISOString()
    };
    this.isEditing = false;
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