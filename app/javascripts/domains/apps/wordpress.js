with (Hasher('WordPress', 'DomainApps')) {

  register_domain_app({
    id: 'badger_wordpress',
    name: 'WordPress',
    icon: 'images/apps/wordpress.png',
    menu_item: { text: 'WordPress', href: '#domains/:domain/apps/wordpress' },
    name_servers_valid: function() {
      var arguments = flatten_to_array(arguments);
      for (var i=0; i<arguments.length; i++) if (!arguments[i].match(/ns\d\.wordpress\.com$/)) return false;
      return true;
    },
    is_installed: function(domain_obj) {
      return ((domain_obj.name_servers||[]).length == 3) && Hasher.domain_apps['badger_wordpress'].name_servers_valid(domain_obj.name_servers);
    },
    install_href: '#domains/:domain/apps/wordpress/install',
    settings_href: '#domains/:domain/apps/wordpress/settings'
  });

  route('#domains/:domain/apps/wordpress/install', function(domain) {
    var app = Hasher.domain_apps['badger_wordpress'];

    with_domain_nav(domain, function(nav_table, domain_obj) {
      render(
        chained_header_with_links(
          { text: 'Domains', href: '#domains' },
          { text: Domains.truncate_domain_name(domain) },
          { text: 'Apps', href: '#domains/'+domain },
          { text: 'WordPress' },
          { text: 'Install' }
        ),

        nav_table(
          p('WordPress.com is a blog web hosting service provider powered by the open source WordPress software.'),
          form_with_loader({ id: 'wordpress-install', 'class': 'fancy', loading_message: 'Installing Wordpress...', action: curry(update_domain_with_wordpress_nameservers, domain_obj) },
            div({ id: 'wordpress-install-errors' }),
            fieldset(
              submit({ 'class': 'myButton' }, 'Install WordPress')
            )
          )
        )
      );
    });
  });

  route('#domains/:domain/apps/wordpress', function(domain) {
    var app = Hasher.domain_apps['badger_wordpress'];

    with_domain_nav(domain, function(nav_table, domain_obj) {
      var name_servers = (domain_obj.name_servers||[]);

      render(
        chained_header_with_links(
          { text: 'Domains', href: '#domains' },
          { text: domain, href: '#domains/'+domain },
          { text: 'Apps', href: '#domains/'+domain },
          { text: 'WordPress' }
        ),

        nav_table(
          div({ 'class': 'sidebar' },
            div({ style: "float: right; margin-top: -47px" },
              a({ 'class': 'myButton', href: app.settings_href.replace(/:domain/,domain) }, 'Settings' )
            ),

            (name_servers.length > 0) && info_message(
              h3('Current Nameservers'),
              ul(
                name_servers.map(function(ns) { return li(ns) })
              )
            )
          ),

          div({ 'class': 'has-sidebar'},
            p("Wordpress DNS settings have successfully been installed into Badger DNS."),
            div(
              span("Last steps before you're all set:"), br(), br(),
              span("1. Visit your wordpress blog ",strong("dashboard"),". (yourblog.wordpress.com/wp-admin) "), br(),br(),
              span("2. Add the domain in the ",strong("Store >> My Domains"), " section of your dashboard."), br(),br(),
              span("3. Switch the primary domain in the ",strong("Store >> My Domains"), " section of your dashboard."), br(),br()
            ),
            p("Once everything is set up and saved, your WordPress URL will automatically redirect to " + domain + "."),
            p (span("For more information, ", a({ href: 'http://en.support.wordpress.com/domains/map-existing-domain/', target: '_blank' }, 'click here'), "."))
          )
          
        )
      );
    });
  });

  route('#domains/:domain/apps/wordpress/settings', function(domain) {
    var app = Hasher.domain_apps['badger_wordpress'];

    with_domain_nav(domain, function(nav_table, domain_obj) {
      render(
        chained_header_with_links(
          { text: 'Domains', href: '#domains' },
          { text: Domains.truncate_domain_name(domain) },
          { text: 'Apps', href: '#domains/'+domain },
          { text: 'Wordpress', href: app.menu_item.href.replace(/:domain/,domain) },
          { text: 'Settings' }
        ),

        nav_table(
          p("To uninstall wordpress, update your domain to no longer use Wordpress's name servers."),

          a({ 'class': 'myButton', href: curry(DnsApp.change_name_servers_modal, domain_obj) }, "Change Name Servers")
        )
      );
    });
  });

  define('update_domain_with_wordpress_nameservers', function(domain_obj) {
    var app = Hasher.domain_apps['badger_wordpress'];
    var name_servers = ['ns1.wordpress.com','ns2.wordpress.com','ns3.wordpress.com'];

    Badger.updateDomain(domain_obj.name, { name_servers: name_servers }, function(response) {
      if (response.meta.status == 'ok') {
        BadgerCache.flush('domains');
        set_route(app.menu_item.href.replace(/:domain/,domain_obj.name));
      } 
      else {
        hide_form_submit_loader();
        $('#wordpress-install-errors').html(error_message(response));
      }
    });
  
  });

};
