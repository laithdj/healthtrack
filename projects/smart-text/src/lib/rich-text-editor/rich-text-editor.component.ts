import * as _ from 'lodash';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  create,
  createOptions,
  HomeTabItemId,
  InsertTabItemId,
  RibbonButtonItem,
  RibbonTabType,
  RichEdit,
  ViewType,
  Field,
  Paragraph,
} from 'devexpress-richedit';
import { DxTextBoxComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { upperFirst } from 'lodash';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { STSetSize } from '../models/set-size.model';
import { STSmartTextNode } from '../models/smart-text-node.model';
import { STMeasurement } from '../models/measurement.model';
import { STSmartTextStyleProperty } from '../models/smart-text-style-property.model';
import { STHeaderStyle } from '../models/enums/header-style.enum';
import { STSmartTextType } from '../models/enums/smart-text-type.enum';
import { STLetterTagValue } from '../models/hms-letter-tag-value.model';
import { STHashTagDictionary } from '../models/hash-tag-dictionary.model';

@Component({
  selector: 'lib-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
})
export class RichTextEditorComponent implements OnDestroy, OnInit, AfterViewChecked {
  private rich: RichEdit;
  private _templateContent: string;
  private _setSize: STSetSize;
  private _readOnly = false;
  private _tagValues: STLetterTagValue[] = [];
  private _smartTextList: STSmartTextNode[];

  @ViewChild('inputRequestTextBox', { static: false }) inputRequestTextBox: DxTextBoxComponent;

  timeout = null;
  showInputRequestPopup = false;
  selectedTag: { startPosition: number, endPosition: number, text: string };
  insertString: string;
  showMultiSelectPopup = false;
  selectionOptions: string[] = [];
  selectedItems: string[] = [];
  multiselectOptions: string[] = [];
  listHeadersInDocument: STSmartTextNode[];
  caretPosition = 0;
  cancelKeyDownEvent = false;
  disablePunctuation: boolean;
  terminators = ['\r', '\n', '`', '=', '[', ']', ';', '\'', ',', '.', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(',
    ')', '+', '{', '}', ' ', ':', '"', '<', '>', '?'];
  hashTagDictionary: STHashTagDictionary[] = [];
  documentLocked = false;
  insertHashtagLoopCount = 0; // tracks the number of times hashtags are recursively added, prevents screen locking up
  hashTagRegex = new RegExp('(?<!\\[)#\\d*[A-Za-z\\d_-]+\\b(?!\\])', 'g');
  multiselectContainsHashTag = false;

  @Output() reportReady: EventEmitter<boolean> = new EventEmitter();
  @Output() fetchLetterTagValues: EventEmitter<string[]> = new EventEmitter();

  @Input() set readOnly(readonly: boolean) {
    this._readOnly = readonly;

    if (this.rich) {
      if (readonly === false) {
        this.rich.updateRibbon((ribbon) => {
          if (ribbon.getTab(RibbonTabType.Home).getItem(HomeTabItemId.ToggleNumberedList)) {
            // toggle list buttons off when editMode is changed
            const numberedListButton = ribbon.getTab(RibbonTabType.Home)
              .getItem(HomeTabItemId.ToggleNumberedList) as RibbonButtonItem;
            numberedListButton.toggleMode = true;

            const bulletListButton = ribbon.getTab(RibbonTabType.Home)
              .getItem(HomeTabItemId.ToggleBulletedList) as RibbonButtonItem;
            bulletListButton.toggleMode = true;
          }
        });

        // enable/disable custom buttons in read only mode
        this.rich.setCommandEnabled('addLog', true);
        this.rich.setCommandEnabled('addHighlight', true);
        this.rich.setCommandEnabled('removeHighlight', true);
        this.rich.setCommandEnabled('clear', true);
      } else {
        this.rich.setCommandEnabled('addLog', false);
        this.rich.setCommandEnabled('addHighlight', false);
        this.rich.setCommandEnabled('removeHighlight', false);
        this.rich.setCommandEnabled('clear', false);
      }
      this.rich.readOnly = readonly;
    }
  }
  get readOnly(): boolean {
    return this._readOnly;
  }

  @Input() set templateContent(content: string) {
    this._templateContent = content;

    setTimeout(() => {
      if (this.rich) {
        if (content && content.trim().length > 0) {
          this.rich.selection.activeSubDocument.deleteText(this.rich.selection.activeSubDocument.interval);
          if (content && content.startsWith('{') && content.startsWith('rtf1', 2)) {
            this.rich.selection.activeSubDocument.insertRtf(0, content);
            // this.store.dispatch(new ReportContentChanged(this.getRtf()));
          } else if (content) {
            this.rich.selection.activeSubDocument.insertText(0, content);
          }
          this.reportReady.emit();
        }
      }
    }, 100);
  }
  get templateContent(): string {
    const content = this.rich.selection.activeSubDocument.getRtf();
    return content;
  }

  @Input() set editorSize(setSize: STSetSize) {
    this._setSize = setSize;
    this.createEditor();

    if (this._templateContent && this._templateContent.trim().length > 0) {
      this.templateContent = this._templateContent;
    }
  }
  get editorSize(): STSetSize {
    return this._setSize;
  }

  @Input() set hmsLetterTagValues(tagValues: STLetterTagValue[]) {
    if (tagValues && tagValues.length > 0) {
      const tagsNotResolved = tagValues?.filter((a: STLetterTagValue) => !this._tagValues?.some(
        (b) => b.tag === a.tag)).map((a) => a.tag);
      this._tagValues = [...tagValues];

      setTimeout(() => { // if still processing document, prevents values not being inserted
      this.rich?.beginUpdate();
        this.documentLocked = true;
      this.resolveHMSLetterTags(tagsNotResolved);
      this.rich?.endUpdate();
        this.documentLocked = false;
      }, 200);
    }
  }
  get hmsLetterTagValues(): STLetterTagValue[] {
    return this._tagValues;
  }

  @Input() set smartTextList(smartText: STSmartTextNode[]) {
    this._smartTextList = smartText;
    const hasTags = smartText?.filter((a) => a.fastTag?.length > 0);
    const hashDict = [];

    hasTags?.forEach((node) => {
      const tags = node.fastTag.split(' ').filter((a) => a.startsWith('#'));
      tags?.forEach((tag) => {
        hashDict.push(new STHashTagDictionary(tag, node.navID));
      });
    });

    this.hashTagDictionary = hashDict;
  }
  get smartTextList(): STSmartTextNode[] {
    return this._smartTextList;
  }

  @Input() listAvailableHeaders: STSmartTextNode[];
  @Input() smartTextNodeList: STSmartTextNode[];
  @Input() smartTextStyleProperties: STSmartTextStyleProperty[];
  @Input() measurements: STMeasurement[];
  @Input() userName: string;

  constructor(private element: ElementRef) { }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.rich) {
      this.rich.dispose();
      this.rich = null;
    }
  }

  ngAfterViewChecked() {
    if (this.rich) {
      this.rich.readOnly = this._readOnly;
    }
  }

  hasContent(): boolean {
    const doc = this.rich.document.interval;
    const text = this.rich.document.getText(doc);
    const table = this.rich.document.tables.count;
    const image = this.rich.document.images.getAllImages();

    return text.trim().length > 0 || table > 0 || image.length > 0;
  }

  createEditor() {
    if (this._setSize && this._setSize.height && this._setSize.width) {
      const options = createOptions();
      options.width = this._setSize.width;
      options.height = this._setSize.height;
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.File));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.PageLayout));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.References));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.MailMerge));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.View));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.TableDesign));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.TableLayout));
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.FloatingObjectsFormat));

      const homeTab = options.ribbon.getTab(RibbonTabType.Home);
      homeTab.removeItem(HomeTabItemId.Undo);
      homeTab.removeItem(HomeTabItemId.Redo);
      homeTab.removeItem(HomeTabItemId.Cut);
      homeTab.removeItem(HomeTabItemId.Copy);
      homeTab.removeItem(HomeTabItemId.Paste);
      homeTab.removeItem(HomeTabItemId.DecreaseFontSize);
      homeTab.removeItem(HomeTabItemId.IncreaseFontSize);
      homeTab.removeItem(HomeTabItemId.ToggleFontStrikeout);
      homeTab.removeItem(HomeTabItemId.ShowFontDialog);
      homeTab.removeItem(HomeTabItemId.ClearFormatting);
      homeTab.removeItem(HomeTabItemId.ChangeCaseMenu);
      homeTab.removeItem(HomeTabItemId.ToggleMultilevelList);
      homeTab.removeItem(HomeTabItemId.AlignParagraphMenu);
      homeTab.removeItem(HomeTabItemId.ToggleShowHiddenSymbols);
      homeTab.removeItem(HomeTabItemId.LineSpacingMenu);
      homeTab.removeItem(HomeTabItemId.Find);
      homeTab.removeItem(HomeTabItemId.Replace);
      homeTab.removeItem(HomeTabItemId.ChangeStyle);
      homeTab.removeItem(HomeTabItemId.ChangeFontName);
      homeTab.removeItem(HomeTabItemId.ChangeParagraphBackColor);

      const sizeItem = homeTab.getItem(HomeTabItemId.ChangeFontSize);
      homeTab.removeItem(HomeTabItemId.ChangeFontSize);

      const boldItem = homeTab.getItem(HomeTabItemId.ToggleFontBold);
      homeTab.removeItem(HomeTabItemId.ToggleFontBold);

      const italicItem = homeTab.getItem(HomeTabItemId.ToggleFontItalic);
      homeTab.removeItem(HomeTabItemId.ToggleFontItalic);

      const underlineItem = homeTab.getItem(HomeTabItemId.ToggleFontUnderline);
      homeTab.removeItem(HomeTabItemId.ToggleFontUnderline);

      const subTextItem = homeTab.getItem(HomeTabItemId.ToggleFontSubscript);
      homeTab.removeItem(HomeTabItemId.ToggleFontSubscript);

      const superTextItem = homeTab.getItem(HomeTabItemId.ToggleFontSuperscript);
      homeTab.removeItem(HomeTabItemId.ToggleFontSuperscript);

      const tableItem = options.ribbon.getTab(RibbonTabType.Insert).getItem(InsertTabItemId.ShowInsertTableDialog);
      tableItem.beginGroup = true;

      const pictureItem = options.ribbon.getTab(RibbonTabType.Insert).getItem(InsertTabItemId.InsertPictureLocally);
      pictureItem.beginGroup = true;

      homeTab.insertItem(sizeItem, 0);
      homeTab.insertItem(boldItem, 1);
      homeTab.insertItem(italicItem, 2);
      homeTab.insertItem(underlineItem, 3);
      homeTab.insertItem(subTextItem, 4);
      homeTab.insertItem(superTextItem, 5);

      const addHighlightButton = new RibbonButtonItem('addHighlight', 'Add Highlight',
        { icon: 'background', showText: false, beginGroup: false });
      homeTab.insertItem(addHighlightButton, 7);

      const removeHighlightButton = new RibbonButtonItem('removeHighlight', 'Remove Highlight',
        { icon: 'clearformat', showText: false, beginGroup: false });
      homeTab.insertItem(removeHighlightButton, 8);

      homeTab.insertItem(tableItem, 11);
      homeTab.insertItem(pictureItem, 12);

      const logButton = new RibbonButtonItem('addLog', 'Log', { showText: true, beginGroup: true });
      homeTab.insertItem(logButton, 15);

      const clearButton = new RibbonButtonItem('clear', 'Clear',
        { icon: 'clearsquare', showText: false, beginGroup: true });
      homeTab.insertItem(clearButton, 16);

      options.events.calculateDocumentVariable = (s, e) => {
        const variable = this.listAvailableHeaders.find((a) => `HeaderNode_${a.navID}` === e.variableName);
        if (variable) {
          if (variable.styleID === STHeaderStyle.Invisible) {
            e.value = '';
          } else {
            e.value = variable.nodeText;
          }
        }
      };

      options.events.keyDown = (s, e) => {
        const headerBeingTargeted = this.getHeaderBeingTargeted();
        if (headerBeingTargeted != null) {
          // Cancel the upcoming KeyPress event, this will prevent most
          // normal keys being used (eg: A-Z, 0-9, Space, etc)
          // Arrow keys are allowed
          this.cancelKeyDownEvent = true;
          if (headerBeingTargeted.interval.end <= this.rich.selection.start) {
            // The cursor is positioned on the header's line but it's after the header so all editing is allowed
            if (e.htmlEvent.code === 'Enter') {
              // By pressing Enter here, normally you'd be trying to go to a new line
              // Fix up the font style in use then force a new line through with the Normal font style
              const rngToUpdate = new IntervalApi(this.rich.selection.start, 1);
              this.applyStyleToRange(rngToUpdate, STHeaderStyle.Normal, true);
              this.addBlankLinesAtPosition(this.rich.selection.active, 1);
              e.handled = true;
              return;
            }
            if (e.htmlEvent.code === 'Space' && headerBeingTargeted.interval.end === this.rich.selection.start) {
              // By pressing space we will force it to have its header style cleared and set to 'normal'
              // The user should then be ready to go with typing in normal font
              this.rich.document.insertText(this.rich.selection.active, ' ');
              const rngToUpdate2 = new IntervalApi(this.rich.selection.start - 1, 1);
              this.applyStyleToRange(rngToUpdate2, STHeaderStyle.Normal, true);
              return;
            }

            // This is not an Enter or Space press, it's something else that should be allowable
            this.cancelKeyDownEvent = false;
          }

          if (headerBeingTargeted.interval.end >= this.rich.selection.start) {
            if (e.htmlEvent.code === 'Delete' || e.htmlEvent.code === 'Backspace' || e.htmlEvent.code === 'Tab') {
              // Don't allow Delete, backspace, tab
              e.handled = true;
              return;
            } if ((e.htmlEvent.shiftKey && e.htmlEvent.code === 'Insert')
              || (e.htmlEvent.ctrlKey && e.htmlEvent.code === 'V')
              || (e.htmlEvent.ctrlKey && e.htmlEvent.code === 'X')) {
              // Don't allow "Paste" or "Cut"
              e.handled = true;
              return;
            } if (this.rich.selection.start === 0 && e.htmlEvent.code === 'Enter') {
              // Cursor at the start of the document
              this.addBlankLinesAtPosition(this.rich.document.interval.start, 1);
              this.rich.selection.setSelection(this.rich.document.interval.start);
              const rngToUpdate = new IntervalApi(this.rich.document.interval.start, 1);
              this.applyStyleToRange(rngToUpdate, STHeaderStyle.Normal, true);
              e.handled = true;
            } else if (e.htmlEvent.code === 'F7') {
              e.handled = true;
            }
          }
          if (this.cancelKeyDownEvent) {
            e.handled = true;
          }
        }
        if (e.htmlEvent.code === 'F4') {
          this.findNextTag();
          e.handled = true;
        } else if (e.htmlEvent.code === 'Space' || e.htmlEvent.code === 'Period'
          || e.htmlEvent.code === 'Enter' || e.htmlEvent.code === 'Comma' || e.htmlEvent.code === 'Semicolon') {
          // resolve hashtags
          const cursorLoc = this.rich.selection.active;
          if (cursorLoc && cursorLoc > 0) {
            // check content before to see if hashtag
            const text = this.rich.document.getText().substr(0, cursorLoc);
            let terminatorLocation = 0;

            this.terminators.forEach((terminatorChar) => {
              const index = text.lastIndexOf(terminatorChar);
              if (index > terminatorLocation) {
                terminatorLocation = index;
        }
            });
            const endText = text.substr(terminatorLocation, cursorLoc);

            if (endText.startsWith('#')) {
              // is hashtag
              const navId = this.hashTagDictionary.find((a) => a.hashTag === endText).smartTextNavId;

              if (navId && navId > 0) {
                const nodeIdx = this.smartTextList.findIndex((a) => a.navID === navId);
                if (nodeIdx > -1) {
                  // remove tag text and insert smart text content
                  const interval = new IntervalApi(terminatorLocation, (cursorLoc - 1));
                  // this.moveCursor(-1);
                  this.rich.document.deleteText(interval);
                  const toMove = 0 - endText.length;
                  this.moveCursor(toMove);
                  this.insertSmartTextNode(this.smartTextList[nodeIdx], true, false, true);
                }
              }
            }
          }
        }
      };

      // add click event handlers for custom buttons
      options.events.customCommandExecuted = (s, e) => {
        const that = this;

        if (e.commandName === 'addHighlight') {
          const selection = s.selection.intervals;

          if (selection && selection[0]) {
            s.history.beginTransaction();
            s.beginUpdate();
            this.documentLocked = true;
            s.document.subDocuments.main.setCharacterProperties(selection[0], { backColor: 'lime' });
            s.endUpdate();
            this.documentLocked = false;
            s.history.endTransaction();
          }
        }

        if (e.commandName === 'removeHighlight') {
          const selection = s.selection.intervals;

          if (selection && selection[0]) {
            s.history.beginTransaction();
            s.beginUpdate();
            this.documentLocked = true;
            s.document.subDocuments.main.setCharacterProperties(selection[0], { backColor: 'NoColor' });
            s.endUpdate();
            this.documentLocked = false;
            s.history.endTransaction();
          }
        }

        if (e.commandName === 'addLog') { // add log to cursor location
          const now = new Date();
          const stringToInsert = `${that.userName} (${now.toLocaleString('en-GB').substring(0, 17)}):`;

          that.insertLineBreak();
          that.addSpaceBehind();
          that.addSmartText(stringToInsert);
          that.moveCursor(1);
        }

        if (e.commandName === 'clear') { // clear editor text
          const result = confirm('Would you like to clear all text in the rich text editor?', 'Attention');
          result.then((dialogResult: boolean) => {
            if (dialogResult !== false) {
              const subDocument = s.selection.activeSubDocument;
              subDocument.deleteText(subDocument.interval);
              const parProp = subDocument.getParagraphProperties(this.rich.document.interval);
              parProp.leftIndent = 0;
              subDocument.setParagraphProperties(this.rich.document.interval, parProp);
              this.clearFields();
            }
          });
        }
      };

      homeTab.title = '';
      options.ribbon.removeTab(options.ribbon.getTab(RibbonTabType.Insert));
      options.ribbon.activeTabIndex = 0;
      // disable the warning shown when leaving/reloading page with unsaved changes in rich text editor
      options.confirmOnLosingChanges.enabled = false;

      // add custom click event with timeout to create a double click event for resolving tags
      options.events.pointerDown = (s) => {
        const cursorLocation = (s.selection && s.selection.active && s.selection.active > 0)
          ? s.selection.active : 0;
        const that = this;

        if (that.rich.readOnly === false) {
          if (that.timeout) {
            clearTimeout(this.timeout);
            that.timeout = null;
            that.getTagAt(cursorLocation);
          } else {
            that.timeout = setTimeout(() => { that.timeout = null; }, 400);
          }
        }
      };

      // hook into event when report content is removed to check if removed content is a tag
      // if a tag is removed, highlighting styling is removed. (if using F4 or selecting a tag and overwriting it)
      options.events.contentRemoved = (s, e) => {
        const tagRegex = '(\\[{2}.*?\\]{2})';
        const regex = new RegExp(tagRegex);
        const result = e.removedText.match(regex);

        if (e?.removedText?.startsWith('[[') && result?.length > 0) {
          s?.document?.setCharacterProperties({ start: e?.interval?.start, length: 1 }, { backColor: 'NoColor' });
        }
      };

      this.rich = create(this.element.nativeElement.firstElementChild, options);
      this.rich.viewType = ViewType.Simple;
      this.readOnly = this._readOnly;

      // set default font properties
      const charProps = this.rich.document.getDefaultCharacterProperties();
      charProps.fontName = 'Arial';
      charProps.size = 9;
      this.rich.document.setDefaultCharacterProperties(charProps);
    }
  }

  // handles double click on a tag
  getTagAt(cursorLocation: number) {
    const text = this.rich.document.getText();
    const tagIndex = text.substring(0, cursorLocation + 2).lastIndexOf('[[');
    const checkEndIsNotBefore = text.substring(tagIndex, cursorLocation - 1).lastIndexOf(']]');

    if (tagIndex > -1 && checkEndIsNotBefore === -1) {
      const tagEndIndex = text.substring(tagIndex, text.length).indexOf(']]');
      const tagEndsAtLocation = tagEndIndex + tagIndex + 2;
      const tag = text.substring(tagIndex, tagEndsAtLocation);

      // is measurement/reference data?
      // eslint-disable-next-line max-len
      const measurementRegex = new RegExp('((\\[{2})(?<Tag>ReferenceData|HMS|EXT)_)(?<Field>.*?)(?<Units>_WithUnits){0,1}(\\]{2})');
      const isMeasurement = measurementRegex.test(tag);

      if (isMeasurement === false) {
        if (tag.startsWith('[[?') && tag.endsWith('?]]')) {
          // is input request
          this.selectedTag = { startPosition: tagIndex, endPosition: tagEndIndex + cursorLocation + 2, text: tag };
          this.insertString = '';
          this.showInputRequestPopup = true;
        } else {
          this.selectedTag = { startPosition: tagIndex, endPosition: tagEndIndex + cursorLocation + 2, text: tag };

          if (tag.startsWith('[[+')) { // is multiselect
            const endOfOptions = text.substring(tagIndex, text.length).indexOf('+][');
            this.multiselectOptions = tag.substring(3, text.substring(tagIndex, text.length).indexOf('+][')).split('+');
            this.selectionOptions = tag.substring(endOfOptions + 3, tag.length - 2).split('][');
            this.selectedItems = [];
            this.insertString = '';
            this.showMultiSelectPopup = true;
          } else if (tag.startsWith('[[TIME')) { // is timestamp
            let time: string;
            const currentTime = new Date();
            const hours = currentTime.getHours();
            const hoursString: string = (hours < 10) ? `0${hours}` : hours.toString();
            const minutes = currentTime.getMinutes();
            const minutesString: string = (minutes < 10) ? `0${minutes}` : minutes.toString();

            if (tag === '[[TIME24]]') {
              time = `${hoursString}:${minutesString}`;
            } else if (tag === '[[TIME12]]') {
              if (hours === 0) {
                time = `12:${minutesString} AM`;
              } else if (hours > 0 && hours < 12) {
                time = `${hours}:${minutesString} AM`;
              } else if (hours === 12) {
                time = `${hours}:${minutesString} PM`;
              } else {
                time = `${hours - 12}:${minutesString} PM`;
            }
            }

            this.rich.document.deleteText({ start: tagIndex, length: tag.length });

            setTimeout(() => {
              this.rich.selection.setSelection(tagIndex);
              this.addSmartText(time);
            }, 20);
          } else if (tag === '[[ENTER]]') {
            this.rich.document.deleteText({ start: tagIndex, length: 9 });
            this.rich.document.insertLineBreak(tagIndex);
            this.rich.document.setCharacterProperties({
              start: tagIndex,
              length: tagIndex + 1,
            }, { backColor: 'NoColor' });
          } else { // is single selection
            let selectedOption = '';
            if (tag.includes('][')) { // has more than one option
              if (cursorLocation > 0) {
                if (tagIndex === cursorLocation || cursorLocation === (tagIndex + 1)) {
                  // is the first option (on opening bracket edge)
                  selectedOption = (tagIndex === cursorLocation)
                    ? text.substring(cursorLocation + 2, text.indexOf(']', cursorLocation))
                    : text.substring(cursorLocation + 1, text.indexOf(']', cursorLocation));
                } else if (tagEndsAtLocation === cursorLocation || cursorLocation === (tagEndsAtLocation - 1)) {
                  // is end of bracket
                  selectedOption = (tagEndsAtLocation === cursorLocation)
                    ? text.substring(text.lastIndexOf('[', cursorLocation) + 1, cursorLocation - 2)
                    : text.substring(text.lastIndexOf('[', cursorLocation) + 1, cursorLocation - 1);
                } else if (text[cursorLocation] === '[') {
                  selectedOption = text.substring(cursorLocation + 1, text.indexOf(']', cursorLocation));
                } else if (text[cursorLocation] === ']') {
                  selectedOption = text.substring(text.lastIndexOf('[', cursorLocation) + 1, cursorLocation);
                } else {
                  selectedOption = text.substring(text
                    .lastIndexOf('[', cursorLocation) + 1, text.indexOf(']', cursorLocation));
                }
              } else { // is first option (prevent index out of range error)
                selectedOption = text.substring(2, text.indexOf(']'));
              }
            } else { // only one option
              selectedOption = tag.substring(2, tag.length - 2);
            }

            this.rich.document.deleteText({ start: tagIndex, length: tag.length });
            let hashTagResolved = false;

            setTimeout(() => {
              this.rich.selection.setSelection(tagIndex);
              // handle double click on hashtags
              if (selectedOption.startsWith('#')) {
                if (selectedOption !== '#CLEAR') {
                  const dictIndex = this.hashTagDictionary?.findIndex((a) => a.hashTag === selectedOption);

                  if (dictIndex > -1) {
                    const nodeIndex = this.smartTextList?.findIndex(
                      (a) => a.navID === this.hashTagDictionary[dictIndex].smartTextNavId);

                    if (nodeIndex > -1) {
                      this.insertSmartTextNode(this.smartTextList[nodeIndex], true, false, false);
                      hashTagResolved = true;
                    }
                  }
                }
              } else {
              this.addSmartText(selectedOption);
              }
            }, 20);

            setTimeout(() => {
              if (hashTagResolved) {
                const updatedText = this.rich?.document?.getText();
                const newLength = updatedText?.length;
                const lengthOfInsertedText = newLength - text.length + tag.length;
                const inserted = updatedText.substring(tagIndex, lengthOfInsertedText + tagIndex);

                if (inserted.startsWith('[[') && inserted.endsWith(']]. ') && inserted.indexOf('][')) {
                  this.getTagAt(tagIndex + 2);
          }
        }
            }, 100);
          }
        }
      } else {
        // is measurement/reference data so do nothing? this should have been resolved already so should never exist
      }
    }
  }

  inputRequestShown() {
    this.inputRequestTextBox.instance.focus();
  }

  addInputRequestClicked() {
    // remove tag, close popup
    this.showInputRequestPopup = false;
    this.showMultiSelectPopup = false;

    // insert text and move cursor to the end of the inserted text
    this.rich.focus();
    this.rich.selection.setSelection(this.selectedTag.startPosition);
    this.rich.document.deleteText({ start: this.selectedTag.startPosition, length: this.selectedTag.text.length });
    const cursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
      ? this.rich.selection.active : 0;
    // const interval = this.addSmartText(this.insertString);
    this.insertTemplateContent(this.insertString);
    // this.rich.document.insertText(cursorLocation, this.insertString);

    // remove highlighting from text
    // if (this.selectedTag.startPosition > 0) {
    //   this.rich.document.setCharacterProperties({
    //     start: this.selectedTag.startPosition - 1,
    //     length: this.insertString.length + 1,
    //   }, { backColor: 'NoColor' });
    // } else {
    //   this.rich.document.setCharacterProperties({
    //     start: this.selectedTag.startPosition,
    //     length: this.insertString.length + 1,
    //   }, { backColor: 'NoColor' });
    // }

    this.rich.selection.setSelection(cursorLocation + this.insertString.length);
  }

  selectionOptionsChanged() {
    this.insertString = '';
    let endJoin = '';
    let join = '';
    const carriageReturn: boolean = this.multiselectOptions.some((a) => a === 'CR');

    this.multiselectOptions.forEach((option) => {
      if (option.startsWith('"') && option.endsWith('"')) {
        join = option.substring(1, option.length - 1);
        if (!this.multiselectOptions.some((a) => a === 'and' || a === 'or')) {
          endJoin = join;
        }
      } else if (option === 'or') {
        endJoin = ' or ';
        join = ', ';
      } else if (option === 'and') {
        endJoin = ' and ';
        join = ', ';
      }
    });

    this.selectedItems.forEach((item, index) => {
      if (index === this.selectedItems.length - 1) { // if is final option in list
        this.insertString += item;
      } else if (this.selectedItems.length > 1 && index === this.selectedItems.length - 2) {
        // is second last item in list
        this.insertString = carriageReturn ? `${this.insertString + item + endJoin}\n`
          : this.insertString + item + endJoin;
      } else {
        this.insertString = carriageReturn ? `${this.insertString + item + join}\n` : this.insertString + item + join;
      }
    });

    // const hashRegex = new RegExp('#\\d*[A-Za-z\\d_-]+\\b', 'g');
    // this.multiselectContainsHashTag = this.selectedItems.some((a: string) => a.startsWith('#') && hashRegex.test(a));
  }

  // used when adding a template to report
  insertTemplateContent(smartTextContent: string): void {
    this.rich.beginUpdate();
    const interval = this.addSmartText(smartTextContent);
    const resolvedInterval = this.resolveTagsForInterval(interval);
    this.rich.endUpdate();
    this.resolveHashTagsForInterval(resolvedInterval);
    this.insertHashtagLoopCount = 0;
  }

  resolveHashTagsForInterval(interval: { start: number, length: number }): { start: number, length: number} {
    let intervalApi = new IntervalApi(interval.start, interval.length);
    let text = this.rich.document.getText(intervalApi);
    const allText = this.rich.document.getText();
    const hashTags = text.match(this.hashTagRegex);
    this.insertHashtagLoopCount += 1;

    if (this.insertHashtagLoopCount < 50) {
      hashTags?.forEach((tag) => {
        if (tag !== '#CLEAR') {
          const tagStart = this.hashTagRegex.exec(text);

          if (tagStart?.index !== undefined && tagStart.index > -1) {
          const dictIndex = this.hashTagDictionary?.findIndex((a) => a.hashTag === tag);

          if (dictIndex > -1) {
            const nodeIndex = this.smartTextList?.findIndex(
              (a) => a.navID === this.hashTagDictionary[dictIndex].smartTextNavId);

            if (nodeIndex > -1) {
                const location = interval.start + tagStart.index;
              this.rich.document.deleteText({ start: location, length: tag.length });
              this.rich.selection.setSelection(location);
                this.insertSmartTextNode(this.smartTextList[nodeIndex], true, false, true);
              const textNow = this.rich.document.getText();
              const textDifference = textNow?.length - allText?.length;
              interval.length += textDifference;
              intervalApi = new IntervalApi(interval.start, interval.length);
              text = this.rich.document.getText(intervalApi);
            }
          }
        }
        }
      });
    }

    this.rich.selection.setSelection(interval.start + interval.length);

    return interval;
  }

  resolveTagsForInterval(interval: IntervalApi): { start: number, length: number} {
    let text = this.rich?.document?.getText(interval);

    // remove ENTER tags
    const enterTagExpression = new RegExp('(\\[{2}ENTER\\]{2})', 'g');
    let containsEnterTags = (enterTagExpression.test(text));

    while (containsEnterTags === true) {
      text = this.rich.document.getText();
      const idx = text.search(enterTagExpression);

      if (idx && idx > -1) {
        this.rich.document.deleteText({ start: idx, length: 9 });
        this.rich.document.insertLineBreak(idx);
        this.rich.document.setCharacterProperties({
          start: idx,
          length: idx + 1,
        }, { backColor: 'NoColor' });
        this.moveCursor(-8);
        interval.length -= 8;
      } else {
        containsEnterTags = false;
      }
    }

    // // replace HMS Letter Template Tags
    const hmsTagExpression = new RegExp('((\\<|&lt;)HMS\\-[^\\>\\&]*(\\>|&gt;))', 'g');
    const hasLetterTags = hmsTagExpression.test(text);

    if (hasLetterTags) {
      const tags = text.match(hmsTagExpression);
      // find any tags that are already in the list, add to report
      // dispatch request to get values for any that are missing
      const valuesMissing = [...new Set(tags?.filter((a: string) => !this.hmsLetterTagValues?.some(
        (b: STLetterTagValue) => b.tag === a)))];

      if (valuesMissing?.length > 0) {
        this.fetchLetterTagValues.emit(valuesMissing);
      }

      this.resolveHMSLetterTags([...new Set(tags)]);
    }

    // replace reference id tags
    text = this.rich.document.getText();
    // eslint-disable-next-line max-len
    const measurementRegex = new RegExp('(\\[{2})(ReferenceData|HMS|EXT)_.*?(_WithUnits){0,1}(\\]{2})', 'g');
    const tags = text.match(measurementRegex);

    if (tags?.length > 0) {
      tags.forEach((tag: string) => {
        const tagStart = text.indexOf(tag);
        const unitsRegex = new RegExp('\\_(\\d+)_WithUnits', 'g');
        const hasUnitsMatch = tag.match(unitsRegex);
        const numberRegex = new RegExp('\\d+', 'g');
        const withUnits: boolean = hasUnitsMatch?.length === 1;
        const numberMatch = tag.match(numberRegex);
        const referenceId = numberMatch?.length === 1 ? +numberMatch[0] : undefined;

        if (referenceId && referenceId > 0) {
          this.rich.selection.activeSubDocument.deleteText({ start: tagStart, length: tag.length });
          interval = new IntervalApi(interval.start, interval.length -= tag.length);

          const refIdx = this.measurements?.findIndex((a) => a.referenceId === referenceId);

          if (refIdx > -1) {
            const result = this.measurements[refIdx];
            if (result?.result) {
              if (withUnits) {
                const insertText = `${result.result} ${result.units}`;
                this.rich.selection.activeSubDocument.insertText(tagStart, insertText);
                interval.length += insertText.length;
              } else {
                const insertText = `${result.result}`;
                this.rich.selection.activeSubDocument.insertText(tagStart, insertText);
                interval.length += insertText.length;
              }
            } else {
              this.rich.selection.activeSubDocument.insertText(tagStart, 'UNKNOWN');
              interval.length += 7;
            }
          } else {
            this.rich.selection.activeSubDocument.insertText(tagStart, 'UNKNOWN');
            interval.length += 7;
          }
        }

        text = this.rich.document.getText();
      });
    }

    // any tags that must be user resolved should be highlighted e.g. multi selects and timestamps
    const textInterval = new IntervalApi(interval.start, interval.length);
    const textInserted = this.rich.document.getText(textInterval);
    const regex = new RegExp('(\\[{2}.*?\\]{2})', 'g');
    const regexResults = textInserted.match(regex);
    let idx = 0;

    regexResults?.forEach((tag: string) => {
      idx = textInserted.indexOf(tag, idx);
          this.rich.history.beginTransaction();
          this.rich.document.setCharacterProperties({
        start: textInterval.start + idx,
        length: tag.length,
          }, { backColor: 'lime' });
          this.rich.history.endTransaction();
      idx += tag.length;
    });

    const newCursorLocation = this.rich.selection.active;
    const length = newCursorLocation - interval.start;

    return { start: interval.start, length };
      }

  resolveHMSLetterTags(tags: string[]) {
    let text = this.rich?.document?.getText();

    tags?.forEach((tag) => {
      let allTagsResolved = false;

      while (!allTagsResolved) {
        const tagStart = text.indexOf(tag);

        if (tagStart > -1 && tagStart < text.length) {
          // replace tag with value
          const value = this.hmsLetterTagValues?.find((a) => a.tag === tag);

          if (value && value.value.length > 0) {
            this.rich.selection.activeSubDocument.deleteText({ start: tagStart, length: tag.length });
            this.rich.selection.activeSubDocument.insertText(tagStart, value.value);

            text = this.rich?.document?.getText();
            } else {
            // value not found
            allTagsResolved = true;
            }
          } else {
          allTagsResolved = true;
          }
        }
    });
      }

  // used when adding smart text to a report - trims white space and resolves tags
  addTrimmedSmartTextAndResolveTags(smartTextContent: string,
    resolveHashTags: boolean): { start: number, length: number } {
    const interval = this.addTrimmedSmartText(smartTextContent);
    const resolvedInterval = this.resolveTagsForInterval(interval);
    this.rich.endUpdate();
    const fullyResolvedInterval = resolveHashTags
      ? this.resolveHashTagsForInterval(resolvedInterval) : resolvedInterval;
    this.rich.beginUpdate();
    return fullyResolvedInterval;
  }

  // used when adding smart text to templates - only trims white space at start and end
  addTrimmedSmartText(smartTextContent: string, capitaliseFirstLetter: boolean = false): IntervalApi {
    // Find if is new line or full stop before, then capitalise first letter, else don't
    // Keep working backwards from insertion point until a character is found. If new line found then capitalise,
    // if characters that aren't a full stop found, don't capitalise as its in the middle of a sentence.
    const cursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
      ? this.rich.selection.active : 0;
    const textBefore = this.rich.document.getText().substring(0, cursorLocation);
    const trim = textBefore.trim();
    const endChar = trim.substring(trim.length - 1, trim.length);

    if (endChar === '.' || endChar === '' || endChar === '>') {
      capitaliseFirstLetter = !this.disablePunctuation;
    }

    if (smartTextContent && smartTextContent.startsWith('{') && smartTextContent.startsWith('rtf1', 2)) {
      const originalLength = this.rich.document.getText().length;

      if (this.rich.selection.intervals.length > 0) {
        // if the header is indent set child smart text to have same paragraph properties as header
        const parProp = this.rich.document.getParagraphProperties(this.rich.selection.intervals[0]);
        this.rich.selection.activeSubDocument.insertRtf(cursorLocation, smartTextContent);
        this.rich.document.setParagraphProperties(this.rich.selection.intervals[0], parProp);
      } else {
        this.rich.selection.activeSubDocument.insertRtf(cursorLocation, smartTextContent);
      }

      let text = this.rich.document.getText();
      const newMainSubDocumentLength = text.length;
      const lengthOfInsertedText = newMainSubDocumentLength - originalLength;

      // remove leading whitespace
      const inserted = text.substring(cursorLocation, lengthOfInsertedText + cursorLocation);
      let deleteRange = 0;
      let hasContent = false;

      for (let index = 0; index < inserted.length; index++) {
        if (hasContent === false) {
          if (!inserted[index] || inserted[index] === '' || inserted[index].trim().length === 0) {
            // if char is whitespace or empty (carriage return) then mark for deletion
            deleteRange += 1;
          } else {
            hasContent = true;
          }
        }
      }

      const first = inserted.substring(deleteRange, deleteRange + 1);
      const isUpperCase = first === first.toUpperCase();

      if (capitaliseFirstLetter && !isUpperCase) { // if first letter is not capitalised
        deleteRange += 1;
        this.rich.document.deleteText({ start: cursorLocation, length: deleteRange });
        this.rich.document.insertText(cursorLocation, first.toUpperCase());
        deleteRange = 0;
      }

      if (isUpperCase && !capitaliseFirstLetter) { // if first letter is capital but should be lowercase
        deleteRange += 1;
        this.rich.document.deleteText({ start: cursorLocation, length: deleteRange });
        this.rich.document.insertText(cursorLocation, first.toLowerCase());
        deleteRange = 0;
      }

      if (deleteRange > 0) {
        this.rich.document.deleteText({ start: cursorLocation, length: deleteRange });
      }

      // trim trailing white space
      text = this.rich.document.getText();
      const remaining = text.substr(cursorLocation, inserted.trim().length);
      const removeFromEnd = lengthOfInsertedText - deleteRange - remaining.length;

      if (removeFromEnd > 0) {
        this.rich.document.deleteText({
          start: cursorLocation + remaining.length,
          length: lengthOfInsertedText - deleteRange - remaining.length,
        });
      }

      this.moveCursor(remaining.length);

      text = this.rich.document.getText();
      const updateCursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
        ? this.rich.selection.active : 0;

      // add trailing full stop and space after if last character is not a full stop
      const positionBefore = text.substring(updateCursorLocation - 1, updateCursorLocation);
      const sentenceEndings = ['.', ',', ':', ';'];

      if ((!sentenceEndings.some((a) => a === positionBefore))&&(!this.disablePunctuation)) {
        const fullStopInterval = this.rich.document.insertText(updateCursorLocation, '.');
        const fullStopCharProps = this.rich.document.getCharacterProperties(fullStopInterval);
        fullStopCharProps.backColor = 'NoColor';
        this.rich.selection.activeSubDocument.setCharacterProperties(fullStopInterval, fullStopCharProps);
        this.moveCursor(1);

        const interval = new IntervalApi(cursorLocation, remaining.length + 2);
        return interval;
      }

      const interval = new IntervalApi(cursorLocation, remaining.length);
      return interval;
    } // is plain text
    let result: IntervalApi;

    if ((smartTextContent) && (!this.disablePunctuation)) {
      const trimmed = smartTextContent.trim(); // remove whitespace
      const upper = capitaliseFirstLetter ? upperFirst(trimmed) : trimmed; // capitalize first letter if needed

      if (upper.endsWith('.')) { // if no full stop, add a full stop
        result = this.addSmartText(`${upper} `);
      } else {
        result = this.addSmartText(`${upper}. `);
      }
    }

    return result;
  }

  // used for adding raw smart text
  addSmartText(smartTextContent: string, isMeasurement: boolean = false): IntervalApi {
    const mainSubDocumentLength = this.rich.document.length;
    let cursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
      ? this.rich.selection.active : 0;
    let spaceInserted = false;

    if (isMeasurement) {
      // insert space before if there isn't one
      const textAtPositionBefore = cursorLocation > 0 ? this.rich.document.getText()
        .substring(cursorLocation - 1, cursorLocation) : ' ';

      if (textAtPositionBefore === ' ' || textAtPositionBefore === '') {
        // do nothing
      } else {
        this.rich.selection.activeSubDocument.insertText(cursorLocation, ' ');
        cursorLocation += 1;
        spaceInserted = true;
      }
    }

    const type = typeof smartTextContent;
    if (type !== 'string') {
      smartTextContent = smartTextContent.toString();
    }

    let interval: IntervalApi;
    if (smartTextContent && smartTextContent.startsWith('{') && smartTextContent.startsWith('rtf1', 2)) {
      this.rich.selection.activeSubDocument.insertRtf(cursorLocation, smartTextContent,
        (insertedInterval, isValidRtf) => {
          interval = insertedInterval;
          if (isValidRtf === false) {
            console.error('invalid rtf');
          }
        });
    } else if (smartTextContent) {
      interval = this.rich.selection.activeSubDocument.insertText(cursorLocation, smartTextContent);
    }

    // move cursor to the end of the inserted text
    const newMainSubDocumentLength = this.rich.document.length;
    const newCursorLocation = cursorLocation + (newMainSubDocumentLength - mainSubDocumentLength);

    if (!spaceInserted) {
      this.rich.selection.setSelection(newCursorLocation);
    } else {
      this.rich.selection.setSelection(newCursorLocation - 1);
    }

    if (!interval) {
      interval = new IntervalApi(cursorLocation, newCursorLocation - cursorLocation);
    }

    return interval;
  }

  addHighlightedText(text: string) {
    const mainSubDocumentLength = this.rich.document.length;
    const cursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
      ? this.rich.selection.active : 0;

    const subDocument = this.rich.selection.activeSubDocument;
    this.rich.history.beginTransaction();
    this.rich.beginUpdate();
    this.documentLocked = true;
    const interval = subDocument.insertText(cursorLocation, text);
    subDocument.setCharacterProperties(interval, { backColor: 'lime' });
    this.rich.endUpdate();
    this.documentLocked = false;
    this.rich.history.endTransaction();

    const newMainSubDocumentLength = this.rich.document.length;
    const newCursorLocation = cursorLocation + (newMainSubDocumentLength - mainSubDocumentLength);
    this.rich.selection.setSelection(newCursorLocation);
  }

  addSpaceBehind() {
    this.addSmartText(' ');
    this.moveCursor(-1);
  }

  insertLineBreak() {
    const cursorLocation = this.rich.selection.active;
    this.rich.document.insertLineBreak(cursorLocation);
    this.moveCursor(1);
  }

  moveCursor(moveBy: number) {
    const cursorLocation = (this.rich.selection && this.rich.selection.active && this.rich.selection.active > 0)
      ? this.rich.selection.active : 0;
    if ((cursorLocation + moveBy) > 0 || (cursorLocation + moveBy) === 0) {
      this.rich.selection.setSelection(cursorLocation + moveBy);
    }
  }

  moveCursorToEnd() {
    if (this.rich && this.rich.selection) {
      this.rich.selection.goToSubDocumentEnd();
    }
  }

  focus() {
    if (this.rich) {
      this.rich.focus();
    }
  }

  getRtf(): string {
    const content = this.rich.selection.activeSubDocument.getRtf(this.rich.selection.activeSubDocument.interval);

    let removeBackgroundFill = content.substring(0, content.indexOf('{\\sp{\\sn fillColor}{\\sv 0}}'));
    removeBackgroundFill += content.substring(removeBackgroundFill.length + 27);

    return removeBackgroundFill;
  }

  clearText() {
    if (this.rich) {
      this.rich.selection.activeSubDocument.deleteText(this.rich.selection.activeSubDocument.interval);
    }
  }

  undoChanges() {
    this.rich.readOnly = false;
    this.clearText();
    this.addSmartText(this._templateContent);
    this.rich.readOnly = this._readOnly;
  }

  // HEADER TRACKING CODE
  addUntrackedHeader(node: STSmartTextNode): void {
    if (node.styleID === STHeaderStyle.Invisible) { return; }

    this.rich.beginUpdate();
    this.documentLocked = true;
    this.prepareForStandardHeaderInsertion();
    const insertRng = this.rich.document.insertText(this.rich.selection.active, node.nodeText);
    this.rich.selection.setSelection(insertRng.end);

    this.applyStyleToRange(insertRng, node.styleID, true);

    // If this header is configured to add a carriage return then insert it now
    if (!node.noNewLinesForHeaders) {
      this.rich.selection.setSelection(this.rich.document.insertParagraph(this.rich.selection.active).interval.end);
    }

    this.rich.endUpdate();
    this.documentLocked = false;
    // Apply focus so the user can start typing
    this.rich.focus();
  }

  goToHeaderOrAddNew(node: STSmartTextNode): void {
    this.rich.beginUpdate();
    const headerExists = this.checkIfHeaderExists(node);
    // check if header exists in the document
    if (headerExists) {
      // Header already exists
      // If the cursor is already in the header's section then don't move it
      // If the cursor is in a different header's section then move the cursor
      // to the end of the correct header's section
      const cursorIsInCorrectPosition = this.isCursorInHeaderSection(node);
      //  look for it in the document and set a cursor to it
      if (!cursorIsInCorrectPosition) { this.goToHeader(node); }
    } else {
      const shouldThisNodeHaveAParent = node.parentID > 0 ? this.listAvailableHeaders?.find(
        (a) => a.navID === node.parentID) : undefined;

      if (shouldThisNodeHaveAParent) {
        const parentHeaderNodeThatShouldExist = this.listAvailableHeaders.find((a) => a.navID === node.parentID);
        const doesParentHeaderNodeExistAlready = this.checkIfHeaderExists(parentHeaderNodeThatShouldExist);
        if (doesParentHeaderNodeExistAlready) {
          // Go to the parent header first, and then let the child header be added under it
          this.goToHeader(parentHeaderNodeThatShouldExist);
        } else {
          // The parent header doesn't exist, so add it first
          this.goToHeaderOrAddNew(parentHeaderNodeThatShouldExist);
        }
      }
      this.addNewHeader(node);
    }

    this.rich.endUpdate();
  }

  checkIfHeaderExists(node: STSmartTextNode): boolean {
    if (!this.listHeadersInDocument) {
      this.initializeHeaderTracking();
    }

    if (this.listHeadersInDocument) {
      const exist = this.listHeadersInDocument.find((a) => a.navID === node.navID);
      if (exist) {
        return true;
      }
      return false;
    }

    return false;
  }

  initializeHeaderTracking(): void {
    this.listHeadersInDocument = [];
    const fields = [];
    const { count } = this.rich.document.fields;

    for (let ii = 0; ii <= count; ii++) {
      fields.push(this.rich.document.fields.getByIndex(ii));
    }

    fields.forEach((fld) => {
      if (fld) {
        const fieldCode = this.rich.document.getText(fld.codeInterval).slice(23);
        const discoveredHeaderIsAvailable = this.listAvailableHeaders.find((a) => a.navID.toString() === fieldCode);
        if (discoveredHeaderIsAvailable) {
          this.listHeadersInDocument.push(discoveredHeaderIsAvailable);
        }
      }
    });
  }

  getChildHeadersInDocument(parentId: number): STSmartTextNode[] {
    return this.listHeadersInDocument.filter((a) => a.parentID === parentId)
      .sort((st1, st2) => st1.displayOrder - st2.displayOrder);
  }

  addNewHeader(node: STSmartTextNode) {
    //    if (_mode != GUIMode.Edit && _mode != GUIMode.New) return;
    //    rtf.Options.DocumentCapabilities.Undo = DocumentCapability.Disabled;
    // Move cursor to appropriate position first
    // The header will be inserted in a position that matches the ordering and tiered structure
    // Get a list of only the header nodes that are on the same Header level as this node
    let relatedNodes: STSmartTextNode[] = [];
    relatedNodes = this.listAvailableHeaders?.filter((a) => a.parentID === node.parentID)
      .sort((st1, st2) => st1.displayOrder - st2.displayOrder);
    //    relatedNodes.AddRange(ListAvailableHeaderNodes.Where(obj => obj.ParentID
    // == headerNode.ParentID).OrderBy(obj => obj.DisplayOrder)
    // .ThenBy(obj => obj.ID).ToList());
    // Find the position that the new header is located in this list, we're searching
    // for existing neighbor nodes so we can insert in between them
    const idxOfHeaderToInsert = relatedNodes?.findIndex((obj) => obj.navID === node.navID);
    let headerInsertionPointFound = false;

    if (this.listHeadersInDocument.length > 0) {
      // Find the insertion point for this header by scanning backwards from
      // the inserting header and find a header that comes before
      for (let ii = idxOfHeaderToInsert - 1; ii >= 0; ii--) {
        const targetHeader = relatedNodes[ii];
        if (this.listHeadersInDocument.find((obj) => obj.navID === targetHeader.navID)) {
          // Header node found to insert after
          // Check to see if the target header has children in the document already
          // If it does, insert after the children
          // If there are no children, insert directly below the target header
          const childHeaders = this.getChildHeadersInDocument(targetHeader.navID);
          if (childHeaders.length > 0) {
            // Child headers are present - go to the very last header then proceed with insert in preparation
            const childNodeToInsertAfter = childHeaders[childHeaders.length - 1];
            // insert after the last child's child
            const childChildHeaders = this.getChildHeadersInDocument(childNodeToInsertAfter.navID);
            if (childChildHeaders.length > 0) {
              this.goToHeader(childChildHeaders[childChildHeaders.length - 1]);
            } else {
              this.goToHeader(childNodeToInsertAfter);
            }
          } else {
            // Go to the header, which will position the cursor at the end of the header block
            this.goToHeader(targetHeader);
          }
          this.prepareForStandardHeaderInsertion();
          headerInsertionPointFound = true;
          break;
        }
      }
    }
    // No header was found to insert after, insert at the start instead
    // Headers with a level 2 or level 3 style will need to be inserted immediately under their parent header
    if (!headerInsertionPointFound) {
      if (node.parentID === -1) {
        // Insert at the start of the box
        this.rich.selection.setSelection(this.rich.document.interval.start);
        //   const targetPar = this.rich_edit.rich.document.getParagraphProperties(
        // this.rich_edit.rich.document.interval);
        const targetPar = this.rich.document.paragraphs.find(this.rich.document.interval.start)[0];
        /// / *** CHECK THIS CODE */
        if (targetPar.interval.length > 1) {
          // There is already text on the first line, insert blank lines to move
          // it down so the header can be inserted at the top
          this.addBlankLinesAtPosition(this.rich.document.interval.start, 2);
          this.rich.selection.setSelection(this.rich.document.interval.start);
          const newRange = new IntervalApi(this.rich.document.interval.start, 2);
          this.applyStyleToRange(newRange, STHeaderStyle.Normal, true);
        }
      } else {
        // This header needs to be inserted directly under its parent
        // The parent should have already been added and the cursor set on it by the previous GoToHeader call
        this.prepareForStandardHeaderInsertion();
      }
    }

    // Create new field and add to store
    this.insertNewHeaderNode(node, false, true);
    //  rtf.Options.DocumentCapabilities.Undo = DocumentCapability.Enabled;
  }

  addBlankLinesAtPosition(positionToInsert: number, blankLineInsertsRequired: number): void {
    for (let ii = 0; ii < blankLineInsertsRequired; ii++) {
      this.rich.selection.setSelection(this.rich.document.insertParagraph(positionToInsert).interval.end);
      positionToInsert = this.rich.selection.active;
    }
  }

  insertNewHeaderNode(node: STSmartTextNode, disableNewLinesAfterHeadings: boolean,
    applyParagraphStyles: boolean): void {
    // , disableNewLinesAfterHeadings: boolean,
    // applyParagraphStyles: boolean)
    this.rich.beginUpdate();
    this.documentLocked = true;
    this.insertNewHeaderNodeHeadless(node, disableNewLinesAfterHeadings, applyParagraphStyles);
    // this.insertLineBreak();
    // this.rich.document.paragraphs.create(this.rich.selection.active);
    // move cursor to the end of the inserted text
    this.rich.endUpdate();
    this.documentLocked = false;
    // Apply focus so the user can start typing
    this.rich.focus();
    // node.HeaderField = newField;
    if (!this.listHeadersInDocument) {
      this.initializeHeaderTracking();
    } else {
      this.listHeadersInDocument.push(node);
    }
  }

  prepareForStandardHeaderInsertion(): void {
    // Get the paragraph where the cursor is
    const cursorPosition = this.rich.selection.active;
    const targetPar = this.rich.document.paragraphs.find(this.rich.selection.active)[0];
    // returns an array with found paragraph
    // const targetPar = parArray[0]; // get the single paragraph
    // If the cursor is on a blank line, but the previous line has text on it,
    // insert a blank line so the header has a clean starting point
    if (targetPar.interval.length === 1 && targetPar.index > 0) {
      // const prevPar = this.rich.document.paragraphs[targetPar[0].index - 1];
      const prevPar = this.rich.document.paragraphs.getByIndex(targetPar.index - 1);

      if (prevPar.interval.length > 1) {
        this.addBlankLinesAtPosition(cursorPosition, 2);
      }
    } else if (targetPar.interval.length > 1) {
      // If there is already text on this line, insert two blank lines so the header has a clean starting point
      this.addBlankLinesAtPosition(cursorPosition, 2);
    }
  }

  insertNewHeaderNodeHeadless(node: STSmartTextNode, disableNewLinesAfterHeadings: boolean,
    applyParagraphStyles: boolean): Field {
    // const doc = this.rich.document;
    // doc.Variables.Remove(headerNode.HeaderSmartTag);
    const invisibleHeader = node.styleID === STHeaderStyle.Invisible;
    let caretPosition = this.rich.selection.active;
    const newField = this.rich.document.fields.create(caretPosition, `${'docvariable HeaderNode_'}${node.navID}`);
    // inserts into document

    newField.isShowCode = false;
    newField.update();
    this.rich.selection.setSelection(newField.interval.end);
    caretPosition = this.rich.selection.active;

    // APPLY STYLING HERE
    if (!invisibleHeader) {
      this.rich.document.insertText(this.rich.selection.active, ' ');
      this.moveCursor(1);
      this.applyStyleToRange(newField.interval, node.styleID, applyParagraphStyles);
      // If this header is configured to add a carriage return then insert it now
      if (!node.noNewLinesForHeaders && !disableNewLinesAfterHeadings) {
        this.rich.selection.setSelection(this.rich.document.insertParagraph(this.rich.selection.active).interval.end);
      }
    }
    return newField;
  }

  // apply styling to headers and paragraph indent
  applyStyleToRange(range: IntervalApi, style: STHeaderStyle, applyParagraphStyles: boolean): void {
    this.rich.history.beginTransaction();
    this.rich.beginUpdate();
    this.documentLocked = true;
    // set range style properties to be default first
    this.rich.document.setCharacterProperties(range, this.rich.document.getDefaultCharacterProperties());
    const charProps = this.rich.document.getCharacterProperties(range);
    const property = this.smartTextStyleProperties?.find((a) => a.headerStyle === style);

    if (!property) { return; } // if no property can be found, do nothing?

    charProps.bold = property.fontBoldItalicsUnderline.indexOf('B') > -1;
    charProps.italic = property.fontBoldItalicsUnderline.indexOf('I') > -1;
    charProps.size = property.fontSize;
    charProps.underline = property.fontBoldItalicsUnderline.indexOf('U') > -1;
    charProps.foreColor = 'black';
    charProps.backColor = 'white';

    if (applyParagraphStyles === true) {
      const parProps = this.rich.document.getParagraphProperties(range);
      parProps.leftIndent = property.indent * 720; // Indent unit is twips, one tab is 720 twips.
      this.rich.document.setParagraphProperties(range, parProps);
    }

    this.rich.document.setCharacterProperties(range, charProps);
    this.rich.endUpdate();
    this.documentLocked = false;
    this.rich.history.endTransaction();
  }

  goToHeader(node: STSmartTextNode): void {
    // It is assumed that this header already exists, so go to it
    // If it doesn't exist in the list, return
    if (!this.listHeadersInDocument.find((obj) => obj.navID === node.navID)) { return; }
    // Sort the headers so they're in order
    // eslint-disable-next-line max-len
    this.listHeadersInDocument.sort((st1, st2) => this.getField(st1)?.resultInterval?.start - this.getField(st2)?.resultInterval?.start);
    // If the target header is at the end of the doc, send the cursor to the very end
    const idxOfTargetHeader = this.listHeadersInDocument.findIndex((obj) => obj.navID === node.navID);
    if (this.listHeadersInDocument?.length === idxOfTargetHeader + 1) {
      this.rich.selection.setSelection(this.rich?.document?.interval?.end); // put cursor at the end of the document
    } else {
      // Find the header that occurs after this target header
      const proceedingHeader = this.listHeadersInDocument[idxOfTargetHeader + 1];
      const proceedingHeaderField = this.getField(proceedingHeader);
      const targetHeader = this.listHeadersInDocument.find((obj) => obj.navID === node.navID);
      const targetHeaderField = this.getField(targetHeader);
      // Step backwards through paragraphs until you find the first paragraph before the proceeding header that has text
      // If no paragraphs with text are found before the header,
      // the blank line immediately after the header will be used
      const parIdxForTargetHeader = this.rich?.document?.paragraphs?.find(targetHeaderField?.resultInterval)[0]?.index;
      // eslint-disable-next-line max-len
      const parIdxForProceedingHeader = this.rich?.document?.paragraphs?.find(proceedingHeaderField?.resultInterval)[0]?.index;
      if (parIdxForProceedingHeader > 0) {
        for (let ii = parIdxForProceedingHeader - 1; ii >= 0; ii--) {
          // This check will stop the loop if the paragraph has text,
          // or if it's the paragraph immediately after the header
          if (this.rich.document.paragraphs.getByIndex(ii).interval.length > 1
            || ii === parIdxForTargetHeader + 1) {
            const parWithText = this.rich.document.paragraphs.getByIndex(ii);
            // Gets the caretPosition for regular positions
            const caretPosition = parWithText?.interval?.end - 1;
            if (this.rich?.document?.tables != null && this.rich?.document?.tables?.count > 0) {
              // Checks weather the current paragraph in with a tablet to then put caret at the end rather then end - 1
              // let isCaretWithinATable = this.rich.document.tables.Any(table => table.Range.Contains(caretPosition));
              //  if (isCaretWithinATable) {
              //    caretPosition = this.rich.document.CreatePosition(parWithText.Range.End.ToInt());
              //  }
            }
            this.rich.selection.setSelection(caretPosition);
            break;
          }
        }
      }
    }

    this.rich.focus();
  }

  getField(node: STSmartTextNode): Field {
    let field;
    const { count } = this.rich.document.fields; // number of fields in collection
    for (let ii = 0; ii <= count; ii++) {
      const fieldIdx = this.rich.document.fields.getByIndex(ii);
      if (fieldIdx) {
        // get the field corresponding to nodes navId
        const fieldText = this.rich.document.getText(fieldIdx.codeInterval);
        const nodeIndex = fieldText.search('_');
        const fieldCode = this.rich.document.getText(fieldIdx.codeInterval).slice(nodeIndex + 1, fieldText.length);
        if (node.navID.toString() === fieldCode) {
          field = fieldIdx;
        }
      }
    }
    return field;
  }

  isCursorInHeaderSection(node: STSmartTextNode): boolean {
    // If it doesn't exist in the list, return
    if (!this.listHeadersInDocument?.find((obj) => obj?.navID === node?.navID)) { return false; }
    // Sort the headers so they're in order
    // eslint-disable-next-line max-len
    this.listHeadersInDocument?.sort((st1, st2) => this.getField(st1)?.resultInterval?.start - this.getField(st2)?.resultInterval?.start);
    const targetHeader = this.listHeadersInDocument?.find((obj) => obj?.navID === node?.navID);
    const caretPositionInt = this.rich?.selection?.active;
    const targetHeaderField = this.getField(targetHeader);
    const targetHeaderPositionInt = targetHeaderField?.resultInterval?.start;
    // If the target header is at the end of the doc,
    // it's a quick check to see if the cursor is in that header section already
    const idxOfTargetHeader = this.listHeadersInDocument?.findIndex((obj) => obj?.navID === node?.navID);
    if (this.listHeadersInDocument?.length === idxOfTargetHeader + 1) {
      if (caretPositionInt >= targetHeaderPositionInt) { return true; }
    } else {
      // Find the header that occurs after this target header
      const proceedingHeader = this.listHeadersInDocument[idxOfTargetHeader + 1];
      const proceedingHeaderField = this.getField(proceedingHeader);
      // If the caret is after the target header and before the proceeding header
      // then it's in the target header's section
      if (caretPositionInt >= targetHeaderPositionInt && caretPositionInt <= proceedingHeaderField
        .resultInterval.start) { return true; }
    }

    return false;
  }

  clearFields(): void {
    const { document } = this.rich;
    const fields = document.fields.count;
    for (let ii = 0; ii < fields; ii++) {
      const fld = document.fields.getByIndex(ii);
      if (fld) { fld.delete(); }
    }
    this.listHeadersInDocument = [];
  }

  getHeaderBeingTargeted(): Field {
    let targetField: Field;

    if (!this.listHeadersInDocument) {
      this.initializeHeaderTracking();
    }

    if (!this.listHeadersInDocument || !this.rich.selection) { return null; }

    const listHeadersFields: Field[] = [];

    this.listHeadersInDocument.forEach((currentPar) => {
      const fld = this.getField(currentPar);
      listHeadersFields.push(fld);
    });

    if (this.rich?.selection?.intervals?.length > 0) {
    const affectedPars = this.rich.document.paragraphs.find(this.rich.selection.intervals[0]);

    if (affectedPars.length > 0) {
      affectedPars.forEach((currentPar) => {
        const headersAffected = listHeadersFields
          .filter((obj) => this.rich.document.paragraphs.find(obj.interval)[0].index === currentPar.index && !!obj);
        if (headersAffected.length > 0) {
          targetField = _.cloneDeep(headersAffected[0]);
        }
      });
    }
    }

    return targetField;
  }

  createListOfNodesToInsert(smartNode: STSmartTextNode): STSmartTextNode[] {
    let result: STSmartTextNode[] = [];
    const parentNode = this.smartTextList.find((pr) => pr.navID === smartNode.parentID);
    // Look up further for any parents and recursively return them into a composed list
    if (parentNode) {
      //  var parentNode = SmartTextHelper.Instance.DictSmartTextNodes[smartNode.ParentID];
      const parentResult = this.createListOfNodesToInsert(parentNode);
      result = result.concat(parentResult);
    }
    // If it's a smart text node (not a group), include the text
    if (smartNode.nodeType === STSmartTextType.SmartText) {
      result.push(smartNode);
    }
    return result;
  }

  insertSmartTextNode(smartNode: STSmartTextNode, generateFullSentence: boolean,
    disablePunctuation: boolean, resolveHashTags: boolean): void {
    this.disablePunctuation = disablePunctuation;
    const listNodes: STSmartTextNode[] = generateFullSentence ? this.createListOfNodesToInsert(smartNode) : [];
    const resultRange: IntervalApi = new IntervalApi(0, 0);

    const lastNode = listNodes[listNodes.length - 1];

  //  this.rich.beginUpdate();
    this.documentLocked = true;
    const originalInsertedParagraphs: Paragraph[] = [];

    listNodes.forEach((node) => {
      if (node.nodeType === STSmartTextType.SmartText) {
        resultRange.start = this.rich.selection.active;
        const interval = this.addTrimmedSmartTextAndResolveTags(node.nodeText, resolveHashTags);
        resultRange.length = interval.length;
      }

      if (lastNode !== node) { this.rich.document.insertText(this.rich.selection.active, ' '); this.moveCursor(1); }
    });

    if(!disablePunctuation){this.rich.document.insertText(this.rich.selection.active, ' '); this.moveCursor(1);}
    this.updateParagraphInfo(resultRange, originalInsertedParagraphs);
   // this.rich.endUpdate();
    this.insertHashtagLoopCount = 0;
    this.documentLocked = false;
    this.rich.focus();
  }

  updateParagraphInfo(range: IntervalApi, originalInsertedParagraphs: Paragraph[]) {
    const paragraphs = this.rich.document.paragraphs.find(range);
    const { leftIndent } = paragraphs[0].properties;
    // Go back one position to check for where to indent to
    if (paragraphs != null && paragraphs.length > 1) {
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];
        const parProps = this.rich.document.getParagraphProperties(para.interval);
        parProps.leftIndent = leftIndent;
        this.rich.document.setParagraphProperties(para.interval, parProps);

        //  para.properties.leftIndent = 720;
        if (originalInsertedParagraphs != null && i < originalInsertedParagraphs.length) {
          const original = originalInsertedParagraphs[i];
          para.properties.leftIndent += original.properties.leftIndent;
          para.properties.firstLineIndent = original.properties.firstLineIndent;
          para.properties.firstLineIndentType = original.properties.firstLineIndentType;
        }
      }
    }
  }

  findNextTag(){
    const hmsQuickFindTagExpressionMask = '(\\[{2}.*?\\]{2})';
    const regex = new RegExp(hmsQuickFindTagExpressionMask);
    let range = new IntervalApi(this.rich.selection.end, this.rich.document.interval.end);
    let fieldText = this.rich.document.getText(range);
    const result = fieldText.match(regex);
    if(result?.length > 0 ){
      const startMatch = this.rich.selection.end + result.index;
      const endMatch = result[0].length;
      const interval = new IntervalApi(startMatch, endMatch);
      this.rich.selection.setSelection(interval);
    }else{
      range = new IntervalApi(this.rich.document.interval.start, this.rich.document.interval.end);
      fieldText = this.rich.document.getText(range);
      const resultAllSearch = fieldText.match(regex);
      if(resultAllSearch?.length > 0 ){
        const startMatch = this.rich.document.interval.start + resultAllSearch.index;
        const endMatch = resultAllSearch[0].length;
        const interval = new IntervalApi(startMatch, endMatch);
        this.rich.selection.setSelection(interval);
      }
    }
  }

  insertReturnComment(comment: string) {
    this.rich.selection.setSelection(0);
    this.addSmartText(comment);
    this.insertLineBreak();
    this.insertLineBreak();
  }
}
