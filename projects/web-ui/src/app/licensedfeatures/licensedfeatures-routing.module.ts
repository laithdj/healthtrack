import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicensedFeaturesComponent } from './licensedfeatures.component';
import { DicomServerComponent } from './dicom-server/dicom-server.component';
import { DicomWorklistComponent } from './dicom-worklist/dicom-worklist.component';
import { BiomedixEcgComponent } from './biomedix-ecg/biomedix-ecg.component';

const licensedFeaturesRoutes: Routes = [
  {
    path: '',
    component: LicensedFeaturesComponent,
    children: [
      { path: 'dsd', component: DicomServerComponent },
      { path: 'dwls', component: DicomWorklistComponent },
      { path: 'bioecg', component: BiomedixEcgComponent },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(licensedFeaturesRoutes),
  ],
  exports: [RouterModule],
})

export class LicensedFeaturesRoutingModule { }
