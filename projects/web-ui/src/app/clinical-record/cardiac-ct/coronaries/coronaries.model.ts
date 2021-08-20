// eslint-disable-next-line max-classes-per-file
export class Grid {
  categoryId!: number;
  categoryName?: string;
  parentCategory!: number;
  refId: number;
  desc: number[];
}
export class CoronariesGrid {
  gridValues: Grid[] = [{
    categoryId: 3, categoryName: 'LMCA', parentCategory: -1, refId: 17300, desc: [],
  },
  {
    categoryId: 4,
    categoryName: 'LMCA',
    parentCategory: 3,
    refId: 17300,
    desc: [17302, 17303, 17304, 17305, 17306, 17307, 17301, 17308, 17309, 17310, 17311,
      17312, 17720, 17721, 17722, 17723, 17724, 17725],
  },
  {
    categoryId: 5,
    categoryName: 'LAD',
    parentCategory: -1,
    refId: 17320,
    desc: [],
  },
  {
    categoryId: 6,
    categoryName: 'Proximal',
    parentCategory: 5,
    refId: 17333,
    desc: [17322, 17323, 17324, 17325, 17326, 17327, 17321, 17328, 17329, 17330, 17331,
      17332, 17726, 17727, 17728, 17729, 17730,
      17731],
  },
  {
    categoryId: 7,
    categoryName: 'Mid',
    parentCategory: 5,
    refId: 17353,
    desc: [17342, 17343, 17344, 17345, 17346, 17347, 17341, 17348, 17349, 17350, 17351,
      17352, 17732, 17733, 17734, 17735, 17736,
      17737],
  },
  {
    categoryId: 8,
    categoryName: 'Distal',
    parentCategory: 5,
    refId: 17373,
    desc: [17362, 17363, 17364, 17365, 17366, 17367, 17361, 17368, 17369, 17370, 17371,
      17372, 17738, 17739, 17740, 17741, 17742,
      17743],
  },
  {
    categoryId: 9,
    categoryName: 'Diagonal-1',
    parentCategory: 5,
    refId: 17393,
    desc: [17382, 17383, 17384, 17385, 17386, 17387, 17381, 17388, 17389, 17390, 17391,
      17392, 17744, 17745, 17746, 17747, 17748,
      17749],
  },
  {
    categoryId: 10,
    categoryName: 'Diagonal-2',
    parentCategory: 5,
    refId: 17413,
    desc: [17402, 17403, 17404, 17405, 17406, 17407, 17401, 17408, 17409, 17410, 17411,
      17412, 17750, 17751, 17752, 17753, 17754,
      17755],
  },
  {
    categoryId: 11,
    categoryName: 'Diagonal-3',
    parentCategory: 5,
    refId: 17433,
    desc: [17422, 17423, 17424, 17425, 17426, 17427, 17421, 17428, 17429, 17430, 17431,
      17432, 17756, 17757, 17758, 17759, 17760,
      17761],
  },
  {
    categoryId: 12,
    categoryName: 'LCX',
    parentCategory: -1,
    refId: 17440,
    desc: [],
  },
  {
    categoryId: 13,
    categoryName: 'Proximal',
    parentCategory: 12,
    refId: 17453,
    desc: [17442, 17443, 17444, 17445, 17446, 17447, 17441, 17448, 17449, 17450, 17451,
      17452, 17762, 17763, 17764, 17765, 17766,
      17767],
  },
  {
    categoryId: 14,
    categoryName: 'Mid',
    parentCategory: 12,
    refId: 17473,
    desc: [17462, 17463, 17464, 17465, 17466, 17467, 17461, 17468, 17469, 17470, 17471,
      17472, 17768, 17769, 17770, 17771, 17772,
      17773],
  },
  {
    categoryId: 15,
    categoryName: 'Distal',
    parentCategory: 12,
    refId: 17493,
    desc: [17482, 17483, 17484, 17485, 17486, 17487, 17481, 17488, 17489, 17490, 17491,
      17492, 17774, 17775, 17776, 17777, 17778,
      17779],
  },
  {
    categoryId: 16,
    categoryName: 'OM-1',
    parentCategory: 12,
    refId: 17513,
    desc: [17502, 17503, 17504, 17505, 17506, 17507, 17501, 17508, 17509, 17510, 17511,
      17512, 17780, 17781, 17782, 17783, 17784,
      17785],
  },
  {
    categoryId: 17,
    categoryName: 'OM-2',
    parentCategory: 12,
    refId: 17533,
    desc: [17522, 17523, 17524, 17525, 17526, 17527, 17521, 17528, 17529, 17530, 17531,
      17532, 17786, 17787, 17788, 17789, 17790,
      17791],
  },
  {
    categoryId: 18,
    categoryName: 'OM-3',
    parentCategory: 12,
    refId: 17553,
    desc: [17542, 17543, 17544, 17545, 17546, 17547, 17541, 17548, 17549, 17550, 17551,
      17552, 17792, 17793, 17794, 17795, 17796,
      17843],
  },
  {
    categoryId: 19,
    categoryName: 'L-PLV',
    parentCategory: 12,
    refId: 17573,
    desc: [17562, 17563, 17564, 17565, 17566, 17567, 17561, 17568, 17569, 17570, 17571,
      17572, 17797, 17798, 17799, 17800, 17801,
      17802],
  },
  {
    categoryId: 20,
    categoryName: 'L-PDA',
    parentCategory: 12,
    refId: 17593,
    desc: [17582, 17583, 17584, 17585, 17586, 17587, 17581, 17588, 17589, 17590, 17591,
      17592, 17803, 17804, 17805, 17806, 17807,
      17808],
  },
  {
    categoryId: 21,
    categoryName: 'RAMUS',
    parentCategory: 12,
    refId: 17613,
    desc: [17602, 17603, 17604, 17605, 17606, 17607, 17601, 17608, 17609, 17610, 17611,
      17612, 17810, 17811, 17812, 17813, 17814,
      17815],
  },
  {
    categoryId: 22,
    categoryName: 'RCA',
    parentCategory: -1,
    refId: 17620,
    desc: [],
  },
  {
    categoryId: 24,
    categoryName: 'Proximal',
    parentCategory: 22,
    refId: 17633,
    desc: [17622, 17623, 17624, 17625, 17626, 17627, 17621, 17628, 17629, 17630, 17631,
      17632, 17844, 17815, 17816, 17817, 17819,
      17820],
  },
  {
    categoryId: 25,
    categoryName: 'Mid',
    parentCategory: 22,
    refId: 17653,
    desc: [17642, 17643, 17644, 17645, 17646, 17647, 17641, 17648, 17649, 17650, 17651,
      17652, 17820, 17821, 17822, 17823, 17824,
      17825],
  },
  {
    categoryId: 26,
    categoryName: 'Distal',
    parentCategory: 22,
    refId: 17673,
    desc: [17662, 17663, 17664, 17665, 17666, 17667, 17661, 17668, 17669, 17670, 17671,
      17672, 17826, 17827, 17828, 17829, 17830,
      17845],
  },
  {
    categoryId: 27,
    categoryName: 'R-PDA',
    parentCategory: 22,
    refId: 17693,
    desc: [17682, 17683, 17684, 17685, 17686, 17687, 17681, 17688, 17689, 17690, 17691,
      17692, 17831, 17832, 17833, 17834, 17835, 17836],
  },
  {
    categoryId: 28,
    categoryName: 'R-PLV',
    parentCategory: 22,
    refId: 17713,
    desc: [17702, 17703, 17704, 17705, 17706, 17707, 17701, 17708, 17709, 17710, 17711,
      17712, 17837, 17838, 17839, 17840, 17841, 17842],
  }];
}
