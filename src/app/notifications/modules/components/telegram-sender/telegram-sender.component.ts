import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TelegramService } from '../../../services/telegram.service';

type MessageType = 'texto' | 'audio' | 'imagen' | 'video';

// Definición de límites
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_LENGTH = 4096; // 4096 caracteres

@Component({
  selector: 'app-telegram-sender',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './telegram-sender.component.html',
  styleUrls: ['./telegram-sender.component.css']
})
export class TelegramSenderComponent {
  messageTypes: MessageType[] = ['texto', 'audio', 'imagen', 'video'];
  selectedType: MessageType = 'texto';
  
  isSending = false;
  error: string | null = null;
  successMessage: string | null = null;
  message: string = '';

  isRecording = false;
  isProcessing = false;
  audioUrl: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioBlob: Blob | null = null;

  selectedVideo: File | null = null;
  videoUrl: string | null = null;

  selectedImage: File | null = null;
  imageUrl: string | null = null;

  constructor(private telegramService: TelegramService) {}

  selectType(type: MessageType) {
    if (this.selectedType === type) return;
    this.cleanupCurrentType();
    this.selectedType = type;
    this.error = null;
    this.successMessage = null;
    this.message = '';
  }

  getTypeIcon(type: MessageType): string {
    const icons = {
      'texto': 'bi bi-chat-text',
      'audio': 'bi bi-mic',
      'video': 'bi bi-camera-video',
      'imagen': 'bi bi-image'
    };
    return icons[type];
  }

  private cleanupCurrentType() {
    switch (this.selectedType) {
      case 'audio':
        this.cleanupAudio();
        break;
      case 'video':
        this.cleanupVideo();
        break;
      case 'imagen':
        this.cleanupImage();
        break;
    }
  }

  async sendMessage() {
    if (!this.message.trim() && this.selectedType !== 'audio') {
      this.error = 'Debes proporcionar una descripción';
      return;
    }

    if (this.message.length > MAX_TEXT_LENGTH) {
      this.error = 'El mensaje excede el límite de 4096 caracteres';
      return;
    }

    if ((this.selectedType === 'video' && !this.selectedVideo) || 
        (this.selectedType === 'imagen' && !this.selectedImage)) {
      this.error = 'Debes seleccionar un archivo';
      return;
    }

    this.isSending = true;
    this.error = null;
    this.successMessage = null;

    try {
      const formData = new FormData();
      formData.append('message', this.message);

      if (this.selectedType === 'video' && this.selectedVideo) {
        formData.append('video', this.selectedVideo);
      } else if (this.selectedType === 'audio' && this.audioBlob) {
        formData.append('audio', this.audioBlob, 'audio.webm');
      } else if (this.selectedType === 'imagen' && this.selectedImage) {
        formData.append('photo', this.selectedImage);
      }

      await this.telegramService.sendMessage(this.selectedType, formData).toPromise();

      this.successMessage = 'Mensaje enviado correctamente';
      this.message = '';
      this.cleanupCurrentType();
    } catch (err) {
      this.error = `Error al enviar el mensaje: ${err}`;
    } finally {
      this.isSending = false;
    }
  }

  handleVideoSelect(event: any) {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE) {
        this.error = 'El archivo de video excede el tamaño máximo de 20 MB';
        return;
      }
      this.cleanupVideo();
      this.selectedVideo = file;
      this.videoUrl = URL.createObjectURL(file);
    } else {
      this.error = 'Por favor selecciona un archivo de video válido';
    }
  }

  private cleanupVideo() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
    this.videoUrl = null;
    this.selectedVideo = null;
  }

  handleImageSelect(event: any) {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGE_SIZE) {
        this.error = 'El archivo de imagen excede el tamaño máximo de 10 MB';
        return;
      }
      this.cleanupImage();
      this.selectedImage = file;
      this.imageUrl = URL.createObjectURL(file);
    } else {
      this.error = 'Por favor selecciona un archivo de imagen válido';
    }
  }

  private cleanupImage() {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
    this.imageUrl = null;
    this.selectedImage = null;
  }

  async toggleRecording() {
    try {
      if (this.isRecording) {
        await this.stopRecording();
      } else {
        await this.startRecording();
      }
    } catch (err) {
      this.error = 'Error al manejar la grabación: ' + (err instanceof Error ? err.message : String(err));
      this.resetState();
    }
  }

  private async startRecording() {
    this.isProcessing = true;
    this.error = null;
    this.successMessage = null;

    try {
      this.cleanupAudio();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioData();
      };

      this.mediaRecorder.onerror = (event) => {
        this.resetState();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } finally {
      this.isProcessing = false;
    }
  }

  private async stopRecording() {
    if (!this.mediaRecorder) return;

    this.isProcessing = true;
    
    try {
      const stopPromise = new Promise<void>((resolve) => {
        if (this.mediaRecorder) {
          this.mediaRecorder.onstop = () => {
            this.processAudioData();
            resolve();
          };
          this.mediaRecorder.stop();
        } else {
          resolve();
        }
      });

      await stopPromise;
      this.isRecording = false;
      this.stopMediaTracks();
    } finally {
      this.isProcessing = false;
    }
  }

  private processAudioData() {
    if (this.audioChunks.length === 0) return;

    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioUrl = URL.createObjectURL(this.audioBlob);
  }

  private cleanupAudio() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.audioUrl = null;
    this.audioBlob = null;
    this.audioChunks = [];
  }

  private stopMediaTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private resetState() {
    this.isRecording = false;
    this.isProcessing = false;
    this.isSending = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stopMediaTracks();
  }

  ngOnDestroy() {
    this.resetState();
    this.cleanupAudio();
    this.cleanupVideo();
    this.cleanupImage();
  }
}
