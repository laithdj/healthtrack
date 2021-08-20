export class STHashTagDictionary {
  hashTag?: string | null;
  smartTextNavId?: number | null;

  constructor(tag: string, navId: number) {
    this.hashTag = tag;
    this.smartTextNavId = navId;
  }
}
