const Target = {
  window: jest.fn().mockReturnValue('a default window'),
};

class Eyes {
  constructor() {
    this.open = jest.fn();
    this.close = jest.fn();
    this.check = jest.fn();
    this.abortIfNotClosed = jest.fn();
    this.setForceFullPageScreenshot = jest.fn();
    this.setConfiguration = jest.fn();
    this.setTestName = jest.fn();
    this.setViewportSize = jest.fn();
  }
}

export { Eyes, Target };
