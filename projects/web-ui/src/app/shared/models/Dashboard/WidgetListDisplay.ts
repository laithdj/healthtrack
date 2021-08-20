export class WidgetListDisplay{
    widgetName: string;
    displayName: string;

    constructor(name: string){
        if (name){
            this.widgetName = name;
            this.displayName = this.listDisplayName(name);
        }
    }

    listDisplayName(widget: string): string {
        switch(widget){
          case "Diary": return widget;
          case "Tasks": return widget;
          case "Documents": return widget;
          case "Incoming": return widget;
          case "Patient": return widget;
          case "Triage": return widget;
          case "Messenger": return widget;
          case "InternalReview": return "Internal Review";
          case "ClinicalRecords": return "Clinical Records";
          case "InitialContact": return "Initial Contact";
          case "IncomingMatching": return "Incoming Matching";
          case "PatientConnect": return "Patient Connect";
          case "LocationDiary": return "Location Diary";
          case "ManualMatching": return "Manual Matching";
          case "DistributionList": return "Distribution List";
          case "IncomingRSD": return "Incoming RSD";
          case "BillingWorksheet": return "Billing Worksheet";
          case "NewRequest": return "New Request";
          default: return "";
        }
      }
}