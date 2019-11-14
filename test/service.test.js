import EyesService from '../src';

class BrowserMock {
  constructor() {
    this.addCommand = jest.fn().mockImplementation((name, fn) => {
      this[name] = fn;
    });

    this.call = jest.fn().mockImplementation((fn) => fn());
  }
}

describe('service', () => {
  beforeEach(() => {
    global.browser = new BrowserMock();
  });

  describe('constructor', () => {
    it('inits variables', () => {
      const options = {
        apiKey: 'apiKey',
      };

      const service = new EyesService(options);

      expect(service.options).toBe(options);
      expect(service.eyes).not.toBe(undefined);
    });

    it('inits options if not provided', () => {
      const service = new EyesService();
      
      expect(service.options).not.toBe(undefined);
    })
  });

  describe('beforeSession', () => {
    it('configures eyes', () => {
      const options = {
        apiKey: 'apiKey',
        appName: 'appName',
      };

      const service = new EyesService(options);

      service.beforeSession();

      expect(service.isConfigured).toBe(true);
      expect(service.eyes.setConfiguration).toBeCalled();
    });

    it('throws exception when apiKey is not defined', () => {
      const options = {
        appName: 'test',
      };

      const service = new EyesService(options);

      expect(service.options.apiKey).toBe(undefined);
      expect(() => service.beforeSession()).toThrow('Could not find APPLITOOLS_API_KEY property in environment properties or apiKey property in service configuration');
    });
  });

  describe('before', () => {
    it('is skipped if eyes were not configured', () => {
      const options = {
        appName: 'test',
      };

      const service = new EyesService(options);

      service.before();

      expect(global.browser.addCommand).not.toBeCalled();
    });

    it('overwrites default viewport', () => {
      const options = {
        viewportSize: {
          width: 200, 
          height: 200
        }
      }

      const service = new EyesService(options);
      service.isConfigured = true;

      service.before();
      expect(service.eyes.setViewportSize).toBeCalledWith(options.viewportSize);
    })

    it('configures default viewport', () => {
      const service = new EyesService();
      service.isConfigured = true;

      const DEFAULT_VIEWPORT = {
        width: 1440,
        height: 900,
      };

      service.before();
      expect(service.eyes.setViewportSize).toBeCalledWith(DEFAULT_VIEWPORT);
    })

    it('configures default forceFullPageScreenshot', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.before();
      expect(service.eyes.setForceFullPageScreenshot).toBeCalledWith(true);
    })

    it('overwrites default forceFullPageScreenshot', () => {
      const options = {
        forceFullPageScreenshot: false
      }

      const service = new EyesService(options);
      service.isConfigured = true;

      service.before();
      expect(service.eyes.setForceFullPageScreenshot).toBeCalledWith(false);
    })

    it('registers commands', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.before();

      expect(global.browser.addCommand).toBeCalled();
      expect(global.browser.addCommand.mock.calls[0]).toContainEqual('takeSnapshot');
      expect(global.browser.addCommand.mock.calls[1]).toContainEqual('takeSnapshotOfTarget');
    });

    it('registers takeSnapshot that requires title', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.before();

      expect(global.browser.takeSnapshot).toThrow('Title for applitools snapshot is missing');

      global.browser.takeSnapshot('Snapshot title');
      
      expect(service.eyes.check).toBeCalledWith('Snapshot title', 'a default window');
    });

    it('registers takeSnapshotOfTarget that requires title and target', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.before();

      expect(global.browser.takeSnapshotOfTarget).toThrow('Title for applitools snapshot is missing');
      expect(() => {
        global.browser.takeSnapshotOfTarget('title');
      }).toThrow('You must specify a target. Example: Target.window()');

      global.browser.takeSnapshotOfTarget('Snapshot title', 'A window');
      
      expect(service.eyes.check).toBeCalledWith('Snapshot title', 'A window');
    });
  });

  describe('beforeScenario', () => {
    it('returns if service is not configured', () => {
      const service = new EyesService();

      service.beforeScenario();

      expect(global.browser.call).not.toBeCalled();
      expect(service.eyes.open).not.toBeCalled();
    });

    it('sets the test name', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.beforeScenario('uri', 'feature', { name: 'scenario name' });
      
      expect(service.eyes.setTestName).toBeCalledWith('scenario name');
    });

    test('opens eyes', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.beforeScenario('uri', 'feature', { name: 'scenario name' });

      expect(global.browser.call).toBeCalled();
      expect(service.eyes.open).toBeCalledWith(global.browser);
    });
  });

  describe('afterScenario', () => {
    it('returns if service is not configured', () => {
      const service = new EyesService();
      service.isConfigured = false;

      service.afterScenario();

      expect(global.browser.call).not.toBeCalled();
      expect(service.eyes.close).not.toBeCalled();
    });

    it('closes eyes', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.afterScenario();

      expect(global.browser.call).toBeCalled();
      expect(service.eyes.close).toBeCalled();
    });
  });

  describe('afterSession', () => {
    it('returns if service is not configured', () => {
      const service = new EyesService();

      service.afterSession();

      expect(global.browser.call).not.toBeCalled();
      expect(service.eyes.abortIfNotClosed).not.toBeCalled();
    });

    it('aborts eyes', () => {
      const service = new EyesService();
      service.isConfigured = true;

      service.afterSession();

      expect(global.browser.call).toBeCalled();
      expect(service.eyes.abortIfNotClosed).toBeCalled();
    });
  });
});
