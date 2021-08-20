import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { take } from 'rxjs/operators';
import { AppState } from '../../app-store/reducers';
import { selectbaseApiUrl } from '../../app-store/app-ui.selectors';
import { ImageTemplateFilesClient, APIResponseOfStringOf } from '../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-image-templates-uploader',
  templateUrl: './image-templates-uploader.component.html',
})
export class ImageTemplatesUploaderComponent implements OnInit {
  @ViewChild(DxFileUploaderComponent) fileUploader: DxFileUploaderComponent;

  showImportedImages = false;
  message = '';
  uploadURL: string;
  messageDivVisible = false;
  uploadOverwriteVisible = false;
  fileUploaderVisible = true;
  uploadSuccess = false;
  overwrite = false;

  @Input() images: string[];
  @Output() imageUploaded: EventEmitter<string[]> = new EventEmitter(true);

  constructor(private store: Store<AppState>,
    private imageTemplateFilesClient: ImageTemplateFilesClient) {
  }

  ngOnInit() {
    this.store.pipe(take(1), select(selectbaseApiUrl)).subscribe((storeurl: string) => {
      this.uploadURL = this.setUploadURL(storeurl, this.overwrite);
    });
  }

  setUploadURL(baseurl: string, overwrite: boolean): string {
    let url = `${baseurl}/api/ImageTemplateFiles/UploadFiles`;

    if (overwrite) {
      url += '?overwrite=true';
    }

    return url;
  }

  resetPopup() {
    this.messageDivVisible = false;
    this.fileUploaderVisible = true;
  }

  onImageUploaded() {
    this.uploadSuccess = true;
    this.messageDivVisible = true;
    this.message = 'Upload Successful!';
    this.fileUploaderVisible = false;
    this.overwrite = false;
    this.imageTemplateFilesClient.get().subscribe((response: APIResponseOfStringOf) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else if (response.data) {
        this.images = response.data;
        this.imageUploaded.emit(response.data);
      }
    });
  }

  onImageUploadError(e) {
    const result = e.request;

    if (result.readyState === 4) {
      switch (result.status) {
        case 417: { // an error occurred during saving
          this.messageDivVisible = true;
          this.message = result.statusText;
          break;
        }
        case 409: { // filename already exists error
          this.fileUploaderVisible = false;
          this.uploadOverwriteVisible = true;
          this.message = result.statusText;
          break;
        }
        case 400: { // save directory doesn't exist or no permission to write there
          this.fileUploaderVisible = false;
          this.messageDivVisible = true;
          this.message = result.statusText;
          break;
        }
        default: {
          this.messageDivVisible = true;
          this.message = 'A connection error has occurred.';
          break;
        }
      }
    }
  }

  onUploadOverwrite() {
    this.uploadOverwriteVisible = false;
    this.messageDivVisible = true;
    this.message = 'WARNING! Any files you upload will now overwrite any existing files of the same filename.';
    this.overwrite = true;
    this.fileUploaderVisible = true;
  }

  onUploadOverwriteCancel() {
    this.uploadOverwriteVisible = false;
    this.fileUploaderVisible = true;
  }
}
