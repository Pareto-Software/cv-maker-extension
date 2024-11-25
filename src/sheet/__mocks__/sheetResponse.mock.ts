export const mockSheetResponse = {
  range: 'Allocation!A1:Z997',
  majorDimension: 'ROWS',
  values: [
    ['', '', '2024', '', '', '', '', '', '', '2025'],
    [
      'Name',
      'Available FTE',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
    ],
    [
      'Jussi Rantanen',
      '1',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '0',
      '0',
      '0',
      '0',
      '0',
      '0',
    ],
    [
      'Aino Heikkilä',
      '1',
      '',
      '',
      '',
      '',
      '',
      '',
      '0.8',
      '1',
      '1',
      '0.7',
      '0.7',
      '0.7',
      '0.7',
    ],
  ]
};

export const modifiedMockSheetResponse = {
  ...mockSheetResponse,
  values: [
    ...mockSheetResponse.values,
    ['New User', '1', '', '', '', '', '', '', '', '1'],
  ],
};

export const emptyMockSheetResponse = {
  ...mockSheetResponse,
  values: []
};
