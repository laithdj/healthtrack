import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  templateDescription = '';
  templateClass: number;
  constructor() { }
}
