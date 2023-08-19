import { Component } from '@angular/core';

import { PhotoService } from '../services/photo.service'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(public PhotoService: PhotoService) {}

  // Charger toutes les photos au demarrage
  async ngOnInit() {
    await this.PhotoService.loadSaved();
  }

  addPhotoToGallery(){
    this.PhotoService.addNewToGallery();
  }

}

