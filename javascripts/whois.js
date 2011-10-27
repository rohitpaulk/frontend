with (Hasher.Controller('Whois','Application')) {
  route({
    '#account/profiles': 'index'
  });
  
  create_action('index', function() {
    BadgerCache.getContacts(function(results) {
      render('index', results.data);
    });
  });
  
  create_action('create_or_update_whois', function(contact_id, callback, form_data) {
    $('#errors').empty();

    var tmp_callback = function(response) {
      if (response.meta.status == 'ok') {
        BadgerCache.flush('contacts');
        BadgerCache.getContacts(function() {
          if (callback) {
            callback();
          } else {
            call_action('Modal.hide');
            call_action('index');
          }
        });
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    }

    if (contact_id) {
      Badger.updateContact(contact_id, form_data, tmp_callback);
    } else {
      Badger.createContact(form_data, tmp_callback);
    }
  });
  
  layout('dashboard');
}

with (Hasher.View('Whois', 'Application')) { (function() {

  create_view('index', function(contacts) {
    return div(
      h1('Whois Profiles'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Whois.edit_whois_modal') }, 'Create New Profile')
      ),

      table({ 'class': 'fancy-table' },
        tbody(
          (contacts || []).map(function(contact) {
            return tr(
              td(
                div(contact.first_name, ' ', contact.last_name),
                div(contact.organization)
              ),
              td(
                div(contact.email),
                div(contact.phone),
                div(contact.fax)
              ),
              td(
                div(contact.address),
                div(contact.address2),
                div(contact.city, ', ', contact.state, ', ', contact.zip),
                div(contact.country)
              ),
              td({ style: "text-align: right" },
                a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Whois.edit_whois_modal', contact) }, 'Edit')
              )
            );
          })
        )
      )
    );
  });

  create_helper('edit_whois_modal', function(data, callback) {
    data = data || {};
    return form({ action: action('create_or_update_whois', data.id, callback) },
      h1(data.id ? 'Edit Whois Profile' : 'Create Whois Profile'),
      div({ id: 'errors' }),
      div(
        input({ name: 'first_name', placeholder: 'First Name', value: data.first_name || '' }),
        input({ name: 'last_name', placeholder: 'Last Name', value: data.last_name || '' }),
        input({ name: 'organization', placeholder: 'Organization (optional)', value: data.organization || '' })
      ),
      br(),
      div(
        input({ name: 'email', placeholder: 'Email', value: data.email || '' }),
        input({ name: 'phone', placeholder: 'Phone', value: data.phone || '' }),
        input({ name: 'fax', placeholder: 'Fax (optional)', value: data.fax || '' })
      ),
      br(),
      div(
        input({ name: 'address', placeholder: 'Address Line 1', value: data.address || '' }),
        input({ name: 'address2', placeholder: 'Address Line 2', value: data.address2 || '' })
      ),
      div(
        input({ name: 'city', placeholder: 'City', value: data.city || '' }),
        input({ name: 'state', placeholder: 'State', value: data.state || '' }),
        input({ name: 'zip', placeholder: 'Zip', value: data.zip || '' })
      ),
      div(
        select({ name: 'country' }, option({ disabled: 'disabled' }, 'Country:'), helper("Application.country_options", data.country))
      ),
      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton' }, data.id ? 'Save' : 'Create'))
    );
  });
})(); }