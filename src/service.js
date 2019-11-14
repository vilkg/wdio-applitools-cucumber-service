import { Eyes, Target } from '@applitools/eyes-webdriverio';

import logger from '@wdio/logger';

const { Configuration } = require('@applitools/eyes-selenium');

const log = logger('wdio-applitools-cucumber-service');

const DEFAULT_VIEWPORT = {
  width: 1440,
  height: 900
};

export default class EyesService {
  constructor(options) {
    this.options = options || {};
    this.eyes = new Eyes();
    this.isConfigured = false;
  }

  beforeSession() {
    const appName = this.options.appName;
    const apiKey = this.options.apiKey || process.env.APPLITOOLS_API_KEY;

    if (!apiKey) {
      throw new Error('Could not find APPLITOOLS_API_KEY property in environment properties or apiKey property in service configuration');
    }

    const configuration = new Configuration();

    configuration.setAppName(appName);
    configuration.setApiKey(apiKey);
    this.eyes.setConfiguration(configuration);

    this.isConfigured = true;
  }

  before() {
    if (!this.isConfigured) {
      return;
    }

    const viewportSize = this.options.viewportSize || DEFAULT_VIEWPORT;
    this.eyes.setViewportSize(viewportSize);

    let forceFullPage = true;

    if (this.options.forceFullPageScreenshot !== undefined) {
      forceFullPage = this.options.forceFullPageScreenshot
    }
     
    this.eyes.setForceFullPageScreenshot(forceFullPage);

    global.browser.addCommand('takeSnapshot', (title) => {
      if (!title) {
        throw new Error('Title for applitools snapshot is missing');
      }

      log.info(`Taking snapshot with title: ${title}`);
      return this.eyes.check(title, Target.window());
    });

    global.browser.addCommand('takeSnapshotOfTarget', (title, target) => {
      if (!title) {
        throw new Error('Title for applitools snapshot is missing');
      }

      if (!target) {
        throw new Error('You must specify a target. Example: Target.window()');
      }

      log.info(`Taking snapshot with title: ${title}`);
      return this.eyes.check(title, target);
    });
  }

  beforeScenario(uri, feature, scenario) {
    if (!this.isConfigured) {
      return;
    }
    this.eyes.setTestName(scenario.name);

    log.info('Opening applitools eyes.');

    global.browser.call(() => this.eyes.open(global.browser));
  }

  afterScenario() {
    if (!this.isConfigured) {
      return;
    }

    log.info('Closing applitools eyes.');
    global.browser.call(() => this.eyes.close());
  }

  afterSession() {
    if (!this.isConfigured) {
      return;
    }

    log.info('Aborting applitools eyes');
    global.browser.call(() => this.eyes.abortIfNotClosed());
  }
}
