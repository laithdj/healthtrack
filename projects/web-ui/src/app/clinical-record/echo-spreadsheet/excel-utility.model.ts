import { saveAs } from 'file-saver'; // npm package: "file-saver": "^1.3.8"
import * as excel from 'igniteui-angular-excel';

export class ExcelUtility {
  public static getExtension(format: excel.WorkbookFormat): string {
    switch (format) {
      case excel.WorkbookFormat.StrictOpenXml:
      case excel.WorkbookFormat.Excel2007:
        return '.xlsx';
      case excel.WorkbookFormat.Excel2007MacroEnabled:
        return '.xlsm';
      case excel.WorkbookFormat.Excel2007MacroEnabledTemplate:
        return '.xltm';
      case excel.WorkbookFormat.Excel2007Template:
        return '.xltx';
      case excel.WorkbookFormat.Excel97To2003:
        return '.xls';
      case excel.WorkbookFormat.Excel97To2003Template:
        return '.xlt';
      default:
        return '.xlsx';
    }
  }

  public static load(file: File): Promise<excel.Workbook> {
    console.log('load', file);
    return new Promise<excel.Workbook>((resolve, reject) => {
      ExcelUtility.readFileAsUint8Array(file).then((a) => {
        excel.Workbook.load(a, null, (w) => {
          resolve(w);
        }, (e) => {
          reject(e);
        });
      }, (e) => {
        reject(e);
      });
    });
  }

  public static loadFromUrl(url: string): Promise<excel.Workbook> {
    return new Promise<excel.Workbook>((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';
      req.onload = () => {
        const data = new Uint8Array(req.response);
        excel.Workbook.load(data, null, (w) => {
          resolve(w);
        }, (e) => {
          reject(e);
        });
      };
      req.send();
    });
  }

  public static save(workbook: excel.Workbook, fileNameWithoutExtension: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const opt = new excel.WorkbookSaveOptions();
      opt.type = 'blob';

      workbook.save(opt, (d) => {
        const fileExt = ExcelUtility.getExtension(workbook.currentFormat);
        const fileName = fileNameWithoutExtension + fileExt;
        saveAs(d as Blob, fileName);
        resolve(fileName);
      }, (e) => {
        reject(e);
      });
    });
  }

  private static readFileAsUint8Array(file: File): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => {
        reject(fr.error);
      };

      if (fr.readAsBinaryString) {
        fr.onload = () => {
          const rs = (fr as any).resultString;
          const str: string = rs != null ? rs : fr.result;
          const result = new Uint8Array(str.length);
          for (let i = 0; i < str.length; i++) {
            result[i] = str.charCodeAt(i);
          }
          resolve(result);
        };
        fr.readAsBinaryString(file);
      } else {
        fr.onload = () => {
          resolve(new Uint8Array(fr.result as ArrayBuffer));
        };
        fr.readAsArrayBuffer(file);
      }
    });
  }
}
