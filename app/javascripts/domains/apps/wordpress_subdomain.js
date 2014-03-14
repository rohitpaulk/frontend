with (Hasher('WordpressSubdomain', 'DomainApps')) {

  register_domain_app({
    id: 'badger_wordpresssubdomain',
    name: 'Wordpress (Subdomain)',
    icon: 'images/apps/wordpress.png',
    menu_item: { text: 'Wordpress (Subdomain)', href: '#domains/:domain/apps/wordpresssubdomain' },
    requires: {
      dns: [
        { type: 'cname', subdomain: 'www', content: /[a-zA-Z0-9_-]+\.wordpress\.com/, content_input: 'wordpress_blog_url' }
      ],
      subdomain_dns: [
        { type: 'cname', subdomain: /[a-zA-Z0-9_-]+/, content: /[a-zA-Z0-9_-]+\.wordpress\.com/, content_input: 'wordpress_blog_url', subdomain_input: "subdomain" }
      ]
    },

    install_screen: function(app, domain_obj) {
      // Aspen & Bamboo Apps: Use YOURAPPNAME.heroku.com
      // Cedar Apps: Use YOURAPPNAME.herokuapp.com      ]
      return div(
        p("WordPress.com is a blog web hosting service provider powered by the open source WordPress software."),
                
        div({ style: 'margin: 25px 0 15px 0' }, "Paste your Wordpress Blog URL below:"),
        div({ id: 'app-error-message', 'class': 'error-message hidden' }),
        form({ action: curry(check_valid_input, app, domain_obj) },
          show_required_dns(app, domain_obj),
          'http://',
          text({ name: 'wordpress_blog_url', placeholder: 'YOURBLOG.wordpress.com', style: 'width: 250px' }),
          '/ ', 
          input({ 'class': 'myButton', type: 'submit', value: 'Install Wordpress' })
        )
      );
    }
  });

  define('check_valid_input', function(app, domain_obj, form_data) {
    var patt = /[a-zA-Z0-9_-]+\.wordpress\.com/;
    var wordpress_blog_url = form_data.wordpress_blog_url;
    if ((wordpress_blog_url != '') && (patt.test(wordpress_blog_url))) {
      install_app_button_clicked(app, domain_obj, form_data);
    } else {
      $('#app-error-message').html('Wordpress Blog URL is invalid.');
      $('#app-error-message').removeClass('hidden');
    }
  });
  
  route('#domains/:domain/apps/wordpresssubdomain', function(domain) {
    with_domain_nav_for_app(domain, Hasher.domain_apps['badger_wordpresssubdomain'], function(nav_table, domain_obj) {
      render(
        h1_for_domain(domain, 'Wordpress(Subdomain)'),
        
        nav_table(
          domain_app_settings_button('badger_wordpresssubdomain', domain),

          div({ id: 'web-forwards-errors' }),

          div("Wordpress DNS settings have been installed into ", a({ href: '#domains/' + domain + 'apps/dns' }, "Badger DNS"), '.'),
          br(),
          div("For more information, ", a({ href: 'http://en.support.wordpress.com/domains/map-subdomain/', target: '_blank' }, 'click here'), '.')
        )
      );
    });
  });
  
   
};