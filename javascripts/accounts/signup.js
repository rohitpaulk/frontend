with (Hasher('Signup','Application')) {
 
  route('#register/:code', function(code) {
    if (Badger.getAccessToken()) {
      set_route('#');
    } else {
      Badger.register_code = code;
      set_route('#');
      show_register_modal();
    }
  });

  route('#reset_password/:email/:code', function(email, code) {
    set_route('#');
    show_reset_password_modal(email, code);
  });

  route('#confirm_email/:code', function(code) {
    set_route('#');
    if (Badger.getAccessToken()) {
      Badger.confirmEmail(code, function(response) {
        show_confirm_email_notification_modal(response.data, response.meta.status);
      });
    } else {
      show_login_modal(function(){
        Badger.confirmEmail(code, function(response) {
        show_confirm_email_notification_modal(response.data, response.meta.status);
      });
    });
    }
  });

  define('require_user_modal', function(callback) {
    var args = Array.prototype.slice.call(arguments, 1);
    var that = this;
    var callback_with_args = function() { callback.apply(that, args); }
    Badger.getAccessToken() ? callback_with_args() : show_register_modal(callback_with_args);
  });

  define('show_login_modal', function(callback) {
    show_modal(
      div({ id: 'signup-box' },
        h1('Login'),
        div({ id: 'signup-errors' }),
        form({ action: curry(process_login, callback) },
          input({ name: 'email', placeholder: 'Email Address' }),

          input({ name: 'password', type: 'password', placeholder: 'Password' }),

          input({ 'class': 'myButton', type: 'submit', value: 'Login' })
        ),
        div({ style: 'margin-top: 20px' },
            a({ href: curry(show_forgot_password_modal, callback) }, "Forgot your password?"), br(),
            a({ href: curry(show_register_modal, callback) }, "Don't have an account?")
        )
      )
    );
    if (!/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
      $('input[name="email"]').focus();
    }
  });

  define('process_login', function(callback, form) {
    $('#signup-errors').empty();
    Badger.login(form.email, form.password, spin_modal_until(function(response) {
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else if (Badger.back_url != "") {
          set_route(Badger.back_url);
          Badger.back_url = "";
        }
      } else if (response.meta.status == 'locked') {
        // we turned invite only mode on, and this person requested an invite, had a person model created, but cannot login yet
        $('#signup-errors').html(
          div({ 'class': "info-message" },
            p("Thanks for requesting an invite to Badger! We aren't quite ready to let you in yet, but once we are, we will notify you via email.")
          )
        );
      } else {
        $('#signup-errors').empty().append(error_message(response));
      }
    }));
  });

  define('show_register_modal', function(callback) {
    show_modal(
      div({ id: 'signup-box' },
        h1('Create Your Badger.com Account'),
        div({ id: 'signup-errors' }),
        form({ action: curry(create_person, callback) },
          input({ type: 'hidden', name: 'invite_code' }),
  
          table({ style: 'width: 100%' }, tbody(
            tr(
              td({ style: 'width: 50%; vertical-align: top' },
                h3({ style: 'margin: 0' }, 'Contact Information'),
                div(
                  input({ style: 'width: 130px', name: 'first_name', placeholder: 'First Name' }),
                  input({ style: 'width: 130px', name: 'last_name', placeholder: 'Last Name' })
                ),
                div(input({ style: 'width: 275px', name: 'organization', placeholder: 'Organization (optional)' })),
                div(input({ name: 'email', style: 'width: 275px', placeholder: 'Email Address' })),
                div(
                  input({ style: 'width: 130px', name: 'phone', placeholder: 'Phone' }),
                  input({ style: 'width: 130px', name: 'fax', placeholder: 'Fax (optional)' })
                )
              ),
              td({ style: 'width: 50%; vertical-align: top' },
                h3({ style: 'margin: 0' }, 'Mailing Address'),
                div(
                  input({ style: 'width: 260px', name: 'address', placeholder: 'Address Line 1' })
                ),
                div(
                  input({ style: 'width: 260px', name: 'address2', placeholder: 'Address Line 2 (Optional)' })
                ),
                div(
                  input({ style: 'width: 118px', name: 'city', placeholder: 'City' }),
                  input({ style: 'width: 40px', name: 'state', placeholder: 'State' }),
                  input({ style: 'width: 70px', name: 'zip', placeholder: 'Zip' })
                ),
                div(
                  select({ style: 'width: 150px', name: 'country' }, option({ disabled: 'disabled' }, 'Country:'), country_options())
                )
              )
            )
          )),
  
          h3({ style: 'margin: 15px 0 0 0' }, 'Password for Badger.com'),
         div(
           input({ name: 'password', style: 'width: 200px', placeholder: 'Desired Password', type: 'password' }),
           input({ name: 'confirm_password', style: 'width: 200px', placeholder: 'Confirm Password', type: 'password' })
         ),
  
  
          div({ style: 'margin: 10px 0' },
            input({ type: 'checkbox', name: 'agree_to_terms', id: 'agree_to_terms', value: true }),
            label({ 'for': 'agree_to_terms' }, ' I agree to the Badger.com '),
            a({ href: window.location.href.split('#')[0] + '#terms_of_service', target: '_blank' }, 'Terms of Service')
          ),
  
          div(
            input({ 'class': 'myButton', type: 'submit', value: 'Create Account' })
          ),
          
          div({ style: 'margin-top: 20px' }, 
            a({ href: curry(show_login_modal, callback) }, "Already have an account?")
          )
        )        
      )
    );
  });
  
  define('show_request_invite_modal', function(arrival_method) {
    if (arrival_method == "free_domain_card") {
      var description = div({ 'class': "info-message" },
        "Thanks for checking us out! We aren't exactly ready to let you in quite yet, but fill out the form below, including your promotional code, send it to us, and we will let you know when you can login."
      );
    }
    
    var require_invite_code = !(typeof(description) == "undefined")
    
    show_modal(
      div({ id: "signup-box" },
        h1("Request Invite to Badger"),
        
        description,
        
        div({ id: 'request-invite-errors' }),
        
        form({ action: curry(request_invite) },
          h3({ style: 'margin: 0' }, 'Contact Information'),
          div(
            input({ style: 'width: 130px', name: 'first_name', placeholder: 'First Name' }),
            input({ style: 'width: 130px', name: 'last_name', placeholder: 'Last Name' })
          ),
          div(input({ name: 'email', style: 'width: 275px', placeholder: 'Email Address' })),
          
          h3({ style: 'margin: 15px 0 0 0' }, 'Password for Badger'),
          div(
            input({ name: 'password', style: 'width: 200px', placeholder: 'Desired Password', type: 'password' }),
            input({ name: 'confirm_password', style: 'width: 200px', placeholder: 'Confirm Password', type: 'password' })
          ),
          
          require_invite_code ? [
            h3({ style: 'margin: 15px 0 0 0' }, 'Invite Code'),
            input({ type: "hidden", name: "require_invite_code", value: true })
          ] : [
            h3({ style: 'margin: 15px 0 0 0' }, 'Invite Code (Optional)')
          ],
          div(
            input({ name: 'invite_code', placeholder: "abc123" })
          ),
          
          div({ style: 'margin: 10px 0' },
            input({ type: 'checkbox', name: 'agree_to_terms', id: 'agree_to_terms', value: true }),
            label({ 'for': 'agree_to_terms' }, ' I agree to the Badger.com '),
            a({ href: window.location.href.split('#')[0] + '#terms_of_service', target: '_blank' }, 'Terms of Service')
          ),
          
          div({ style: "margin-top: 10px" },
            input({ 'class': 'myButton', type: 'submit', value: 'Request Invite' })
          ),
          
          div({ style: 'margin-top: 20px' }, 
            a({ href: curry(show_login_modal) }, "Already have an account?")
          )
          
        )
      )
    );
  });

  define('create_person', function(callback, data) {
		if(data.password != data.confirm_password) {
			$('#signup-errors').empty().append(error_message({ data: { message: "Passwords do not match" } }));
      return;
		}
		
    // if (!data.agree_to_terms) {
    //   $('#signup-errors').empty().append(error_message({ data: { message: "You must accept terms of service to use our site" } }));
    //   return;
    // }
    
    if (Badger.register_code) data.invite_code = Badger.register_code;

    Badger.createAccount(data, spin_modal_until(function(response) {
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else {
          set_route('#');
          setTimeout(SiteTour.site_tour_0, 250);
        }
      } else {
        $('#signup-errors').empty().append(error_message(response));
      }
    }));
  });
  
  
  
  define('request_invite', function(form_data) {
    if (form_data.password != form_data.confirm_password) {
			$('#signup-errors').empty().append(error_message({ data: { message: "Passwords do not match" } }));
      return;
		}
		
		console.log(form_data);
		
    if (form_data.require_invite_code && !form_data.invite_code) {
      $('#signup-errors').empty().append(error_message({ data: { message: "Missing invite code!" } }));
      return;
    }
		
		// old invite code stuff
    // if (Badger.register_code) form_data.invite_code = Badger.register_code;
		
    Badger.requestInviteAndCreatePerson(form_data, function(response) {
      console.log(response);
      
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else {
          show_invite_sent_modal(response.data);
        }
      } else {
        $('#request-invite-errors').empty().append(error_message(response));
      }
    });
  });
  
  define('show_invite_sent_modal', function(request_invite_data) {
    set_route("#");
    
    return show_modal(
      h1("Invite Request Sent"),
      p("We will be ready to accept your invite soon, sorry to make you wait! When your invite is approved, we will email you."),
      
      (request_invite_data.invite_code) ? [
        p("Your free domain code has been applied, and the ", request_invite_data.invite_code.domain_credits, " domain credit(s) will be applied to your account when we approve the invite.")
      ] : [
        div()
      ]
    );
  });
  
  

	define('show_reset_password_modal', function(email, code) {
    show_modal(
			form({ action: curry(reset_password, null) },
				h1("Enter your new password"),
				div({ id: 'reset-password-messages' }),
				div({ id: 'reset-password-form' },
					div({ style: 'margin: 20px 0; text-align: center' },
					  input({ name: "email", type: 'hidden', value: email }),
						input({ name: "code", type: 'hidden', value: code  }),
						input({ name: "new_password", type: 'password', placeholder: "New Password" }),
						input({ name: "confirm_password", type: 'password', placeholder: "Confirm New Password" }),
						input({ 'class': 'myButton small', type: 'submit', value: 'Update' })
					)
				)
			)
		);
	});

	define('show_forgot_password_modal', function(callback) {
    show_modal(
			form({ action: curry(send_password_reset_email, callback) },
				h1("Forgot Password"),
				div({ id: 'forgot-password-messages' }),
				div({ id: 'forgot-password-form', style: 'margin: 20px 0; text-align: center' },
					input({ name: "email", type: "text", 'class': 'fancy', size: 30, placeholder: "Email" }),
					input({ 'class': 'myButton', type: 'submit', value: 'Send Reset Code' })
				),
        div({ style: 'margin-top: 20px' },
  				a({ href: curry(show_login_modal, callback) }, "Remember your password?"), br(),
          a({ href: curry(show_register_modal, callback) }, "Don't have an account?")
        )
			)
		);
	});

	define('send_password_reset_email', function(callback, form_data) {
		Badger.sendPasswordResetEmail(form_data, function(response) {
			if (response.meta.status == 'ok') {
        $('#forgot-password-messages').empty().append(success_message(response));
				$('#forgot-password-form').empty();
			} else {
				$('#forgot-password-messages').empty().append(error_message(response));
			}
		});
	});

	define('reset_password', function(callback, form_data) {
		if(form_data.new_password != form_data.confirm_password)
			return $('#reset-password-messages').empty().append( error_message({ data: { message: "Passwords do not match" } }) );

		Badger.resetPasswordWithCode(form_data, function(response) {
			if (response.meta.status == 'ok')
			{
        setTimeout(function() {
          show_modal(
            h1("Reset Password"),
            success_message(response),
            a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
          );
        }, 250);
			}
			else
			{
				$('#reset-password-messages').empty().append(error_message(response));
			}
		});
	});

  define('show_confirm_email_notification_modal', function(data, status) {
    show_modal(
      h1("Confirm Email Message"),
      status == 'ok' ? p(data.message + ". You can close this window now.") : p({ 'class':  'error-message'}, data.message),
      a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
    );
	});

}
