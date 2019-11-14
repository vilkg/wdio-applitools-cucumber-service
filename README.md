# WDIO5 with CucumberJS Applitools Service

## Configuration

### Properties

| Property name | Is required | Default value | Description |
| --- | --- | --- | --- 
| apiKey| true | -  | API_KEY you use to connect to applitools eyes |
| appName | false | - | |
| viewportSize | false | width:  1440, height:  900 | 
| forceFullPageScreenshot | false | true | 

### Example
```
services: [
    [ 'wdio-applitools-cucumber-service' , {
      appName: "app name",
      apiKey: "apiKey", 
      forceFullPageScreenshot: true,
      viewportSize: {
        width: 1440,
        height: 900,
      }
    }]
  ]
```

## Usage

The service adds 2 global.browser commands: 
- takeSnapshot
- takeSnapshotOfRegion

### Example

`browser.takeSnapshot('Login page');`

`browser.takeSnapshotOfRegion('Login page', Target.window().fully())`