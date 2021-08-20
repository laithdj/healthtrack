import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { LandingComponent } from './auth/landing.component';
import { AuthenticatedGuard } from './auth/authentication.guard';

const appRoutes: Routes = [
  { path: '', component: NotFoundComponent },
  { path: 'landing', component: LandingComponent },
  {
    path: 'contracts',
    loadChildren: () => import('./contracts/contracts.module').then((m) => m.ContractsModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'image-templates',
    loadChildren: () => import('./image-templates/image-templates.module').then((m) => m.ImageTemplatesModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'annotation-tools',
    loadChildren: () => import('./annotation-tools/annotation-tools.module').then((m) => m.AnnotationToolsModule),
  },
  {
    path: 'recordManagement',
    loadChildren: () => import('./clinical-record-management/clinical-record-management.module')
      .then((m) => m.ClinicalRecordManagementModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'pc-management',
    loadChildren: () => import('./patientconnect/pc-management/pc-management.module').then((m) => m.PcManagementModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'pc-practicewide',
    loadChildren: () => import('./patientconnect/pc-practicewide/pc-practicewide.module')
      .then((m) => m.PcPracticeWideModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'pap-system',
    loadChildren: () => import('./pap-system/pap-system.module').then((m) => m.PapSystemModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'pc-patient',
    loadChildren: () => import('./patientconnect/pc-patient-program/pc-patient-program.module')
      .then((m) => m.PcPatientProgramModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'pc-replycontent',
    loadChildren: () => import('./patientconnect/pc-replycontent/pc-replycontent.module')
      .then((m) => m.PcReplyContentModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'dashboard-configuration',
    loadChildren: () => import('./dashboard/dashboard-configuration/dashboard-configuration.module')
      .then((m) => m.DashboardConfigurationModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'licensedfeatures',
    loadChildren: () => import('./licensedfeatures/licensedfeatures.module').then((m) => m.LicensedFeaturesModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'roster-template',
    loadChildren: () => import('./roster/roster-template/roster-template.module').then((m) => m.RosterTemplateModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then((m) => m.InventoryModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'triage',
    loadChildren: () => import('./triage/triage.module').then((m) => m.TriageModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'equipment-rostering',
    loadChildren: () => import('./equipment-rostering/equipment-rostering.module')
      .then((m) => m.EquipmentRosteringModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'healthfund-fees-table',
    loadChildren: () => import('./healthfund/healthfund-fees-table/healthfund-fees-table.module')
      .then((m) => m.HealthfundFeesTableModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'billing-worksheet',
    loadChildren: () => import('./billing-worksheet/billing-worksheet.module').then((m) => m.BillingWorksheetModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'questionnaire-admin',
    loadChildren: () => import('./questionnaire-admin/questionnaire-admin.module')
      .then((m) => m.QuestionnaireAdminModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'rich-text',
    loadChildren: () => import('./rich-text-editor-testing/rich-text-editor-testing.module')
      .then((m) => m.RichTextEditorTestingModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'online-booking',
    loadChildren: () => import('./doctor-booking/doctor-booking.module').then((m) => m.DoctorBookingModule),
  },
  {
    path: 'clinical-record',
    loadChildren: () => import('./clinical-record/clinical-record.module').then((m) => m.ClinicalRecordModule),
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'echo-spreadsheet',
    loadChildren: () => import('./clinical-record/echo-spreadsheet/echo-spreadsheet.module')
      .then((m) => m.EchoSpreadsheetModule),
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  {
    path: 'not-found',
    component: NotFoundComponent,
    data: { message: 'Page not found!' },
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
