if (Badger.dev_mode) {
  with (Hasher()) {
    define('set_api_host', function(env) {
      Badger.setCookie('badger_environment', env, { global: true });
      document.location.reload();
    });

    after_filter('add_dev_mode_bar', function() {
      if (!document.getElementById('dev-bar')) {
        document.body.appendChild(
          div({ id: 'dev-bar', style: "position: fixed; bottom: 0; right: 0; background: white; color: black; padding: 5px; z-index: 200" },
            (Badger.environment == 'test' ? [b('test'), ' | '] : []),
            (Badger.environment == 'demo' ? b('demo') : a({ href: curry(set_api_host, 'demo') }, 'demo')),
            ' | ',
            (Badger.environment == 'development' ? b('dev') : a({ href: curry(set_api_host, 'development') }, 'dev')),
            ' | ',
            (Badger.environment == 'staging' ? b('staging') : a({ href: curry(set_api_host, 'staging') }, 'staging')),
            ' | ',
            (Badger.environment == 'production' ? b('prod') : a({ href: curry(set_api_host, 'production') }, 'prod'))
          )
        );
      }
    });
  }
}
