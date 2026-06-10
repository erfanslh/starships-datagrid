import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.css',
})
export class ErrorBannerComponent {
  @Input() message = '';
  @Output() retry = new EventEmitter<void>();
}
