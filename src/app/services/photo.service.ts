import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo  } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences'

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  constructor() { }

  public async addNewToGallery(){
    
    // Fonction pour capturer une image a travers la Camera
    const capturePhoto = await Camera.getPhoto({
      resultType : CameraResultType.Uri,
      source : CameraSource.Camera,
      quality : 100
    });

    // Afficher la photo dans la page
    this.photos.unshift({
        filepath: "soon...",
        webviewPath: capturePhoto.webPath!
      });

    // Sauvegarder la photo et l'afficher dans la gallerie
    const savedImageFile = await this.savePicture(capturePhoto);
    this.photos.unshift(savedImageFile);

    /*
    - Enregistrer le tableau Photos (déclaré en haut)
    - sous forme de cle-valeur
    - Ainsi le tableau Photos est stocké 
    - chaque fois qu’une nouvelle photo est prise
    */
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  // Sauvegarder la photo à travers l'API Filesystem de capacitor
  public async savePicture(photo : Photo){
    
    // Convertir la phot en fichier base 64 
    const base64Data = await this.readAsBase64(photo);

    // Ecrire le fichier dans le repertoire
    const fileName = Date.now() + '.jpg|png|jpeg'; // Nom et extension
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    // Utiliser le webPath pour afficher l'image à la place de base64
    // car il est déjà chargé en memeoire;
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };

  }

  private async readAsBase64(photo: Photo) {
    /*
    - Récupérer la photo,
    - lir en tant que blob,
    - puis la convertir au format base64
    */
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  // Fonction pour convertir le blob en base64
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  /* Fonction pour charger le tableau de photos
    - Récupérer les données
    - Utilise la même clé pour récupérer
    - le tableau de photos au format JSON,
    - puis l’analyser dans le tableau
  */
  public async loadSaved() {
    
    // Récupérer les données du tableau de photos mises en cache
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // Afficher les photos en lisant au format base64
    for (let photo of this.photos) {
      /* 
        -Lire chaque photo sauvegardée
        - depuis la base de photo enregistrées du Filesystem
      */ 
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      // Plateforme web uniquement : Charger la photo en tant que données base64
      photo.webviewPath = `data:image/.jpg|png|jpeg;base64,${readFile.data}`;
    }
  }

}


// Interface d'affichage de la photo
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

