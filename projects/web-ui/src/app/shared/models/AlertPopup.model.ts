export class AlertPopup {
  title?: string;
  errorMessages: string[];

  constructor(errorMessages: string[], title?: string) {
    if (title) { this.title = title; }

    this.errorMessages = errorMessages;
  }
}
