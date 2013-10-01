if (document.location.host == 'www.badger.com') {
  Badger.environment = 'production';
  Badger.google_analytics = 'UA-26014842-2';
} else if (document.location.host == 'staging.badger.com') {
  Badger.environment = 'staging';
} else if (document.location.host == 'demo.badger.com') {
  Badger.environment = 'demo';
} else if (navigator.userAgent == 'Selenium') {
  Badger.environment = 'test';
} else {
  Badger.environment = Badger.getCookie('badger_environment', { global: true}) || 'development';
}

if (Badger.environment == 'production') {
  Badger.api_host = 'https://api.badger.com/';
} else if (Badger.environment == 'staging') {
  Badger.api_host = 'https://staging-api.badger.com/';
} else if (Badger.environment == 'development') {
  Badger.api_host = 'http://localhost:5000/';
} else if (Badger.environment == 'demo') {
  Badger.api_host = 'http://test.example/';
} else if (Badger.environment == 'test') {
  Badger.api_host = 'http://test.example/';
}
