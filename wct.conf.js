/*

 Make sure the environment variables SAUCE_USERNAME and SAUCE_ACCESS_KEY set or
 you have to pass the sauce user name and credentials on the command line when
 invoking wct remote.

 To run all the webcomponents tests invoke the following command
 wct --plugin local
 or
 wct --plugin sauce

 to Run specific webcomponents modules
 From the command line run
 wct --plugin local tests\ShadowDOM\runner_wct.html
 or
 wct --plugin sauce tests\ShadowDOM\runner_wct.html

 The Sauce configuration is from
 https://docs.saucelabs.com/reference/platforms-configurator

 For code coverage
 wct --plugin local --plugin web-component-tester-istanbul tests\ShadowDOM\runner_wct.html
 Not working for now.

*/
module.exports = {
  verbose: false,
  suites: ['tests/runner_wct.html'],
  plugins: {
    local: {
      disabled: true,
      browsers: [
        'chrome',
        'firefox',
        'ie'
      ]
    },
    sauce: {
      disabled: true,
      browsers: [
         'Windows 7/chrome@41.0',
         'Windows 7/firefox@35.0',
         'Windows 7/internet explorer@11.0',
         'Windows 7/internet explorer@10.0',
         'Windows 7/internet explorer@9.0',

         'Windows 8.1/chrome@41.0',
         'Windows 8.1/firefox@35.0',
         'Windows 8.1/internet explorer@11.0',
         'Windows 8/internet explorer@10.0',

         // Mountain Lion
         'OS X 10.8/safari@6.0',

         // Mavericks
         'OSX 10.9/safari@7.0',

         // Yosemite
         'OS X 10.10/safari@8.0'

      ]
    },
    // an attempt for code coverage. Currently it throws
    // Cannot read property '__coverage__' of undefined
    "web-component-tester-istanbul": {
      disabled: true,
      dir: "./coverage",
      reporters: ["text-summary", "lcov"],
      include: [
        "*.js"
      ],
      exclude: [
      ]
    }
  }
};