with (Hasher('ContactUs','Application')) {
 
  route('#contact_us', function() {
    render(
      h1('Contact Us'),
      
      form({ 'class': 'fancy has-sidebar', action: submit_email, id: 'send-contact-us-form' },
        div({ id: 'send-contact-us-form-errors' }),

        fieldset(
          label('To:'),
          span({ style: 'font-size: 18px' }, a({ href: 'mailto:support@badger.com' }, 'support@badger.com'))
        ),
        
        (!Badger.getAccessToken() ? [
          fieldset(
            label({ 'for': 'name-input' }, 'Your name:'),
            text({ name: 'name', id: 'name-input', placeholder: 'John Doe' })
          ),
        
          fieldset(
            label({ 'for': 'email-input' }, 'Your email:'),
            text({ name: 'email', id: 'email-input', placeholder: 'john.doe@badger.com' })
          ),
        ]:[]),
        

        fieldset(
          label({ 'for': 'subject-input' }, 'Subject:'),
          text({ name: 'subject', id: 'subject-input', placeholder: 'Brief description' })
        ),

        fieldset(
          label({ 'for': 'body-input' }, 'Body:'),
          textarea({ name: 'body', id: 'body-input', placeholder: 'Detailed description' })
        ),
        
        fieldset({ 'class': 'no-label' },
          input({ type: 'submit', value: 'Send', 'class': "myButton" })
        )
      )
    );
  });
  
  define('submit_email', function(form_data) {
    render({ target: 'send-contact-us-form-errors' }, '');

    Badger.sendEmail(form_data, function(response) {
      if (response.meta.status == 'ok') {
        render({ target: 'send-contact-us-form' },
          success_message("Your email has been sent!")
        );
      } else {
        render({ target: 'send-contact-us-form-errors' }, error_message(response));
      }
    });
  });

}
