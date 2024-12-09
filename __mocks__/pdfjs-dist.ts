export const getDocument = jest.fn(() => ({
  promise: Promise.resolve({ textContent: jest.fn() }),
}));
