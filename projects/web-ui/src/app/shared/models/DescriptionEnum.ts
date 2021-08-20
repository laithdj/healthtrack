// eslint-disable-next-line max-classes-per-file
export class SegmentOptions {
  id: number;
  name: string;
  reason?: boolean;
}
export class CoronaryOptions {
  optionsArray: SegmentOptions[];
}

export class CoronaryEnum {
  coronaryOptions: CoronaryOptions[] =
  [{
    optionsArray: [{ id: 1, name: 'Normal' }, { id: 2, name: '<25% - Minimal' },
      { id: 3, name: '25%-49% - Mild' }, { id: 4, name: '50%-69% - Moderate' },
      { id: 5, name: '70%-99% - Severe' },
      { id: 6, name: 'Occluded' }, { id: 7, name: 'Non-Evaluable - Reason:' }],
  },
  { optionsArray: [{ id: 1, name: 'Motion', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Noise', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Calcium', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Stent', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Other', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Non-Calcified' }, { id: 2, name: 'Calcified' }, { id: 3, name: 'Mixed' }] },
  { optionsArray: [{ id: 1, name: 'Positive Re-Modelling' }] },
  { optionsArray: [{ id: 1, name: 'Low-Attenuation Plaque' }] },
  { optionsArray: [{ id: 1, name: 'Spotty Calcification' }] },
  { optionsArray: [{ id: 1, name: 'Napkin Ring' }] },
  { optionsArray: [{ id: 1, name: 'Diffuse' }, { id: 2, name: 'Focal' }] },
  { optionsArray: [{ id: 1, name: 'Large' }, { id: 2, name: 'Moderate' }, { id: 3, name: 'Small' }] },
  {
    optionsArray: [{ id: 1, name: 'No Significant ISR' }, { id: 2, name: 'Severe ISR:' },
      { id: 3, name: 'Peri-Stent-Restenosis:' },
      { id: 4, name: 'Non-Evaluable - Reason:' }],
  },
  { optionsArray: [{ id: 1, name: 'Sever ISR Details:' }] },
  { optionsArray: [{ id: 1, name: 'Peri-Stent-Restenosis Details:' }] },
  { optionsArray: [{ id: 1, name: 'Small Stent Size', reason: true }] },
  { optionsArray: [{ id: 1, name: 'Motion', reason: true }] },
  ]
}
