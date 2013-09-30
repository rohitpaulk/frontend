with (Hasher('About', 'Application')) {
  
  route('#about', function() {
    render(
      h1('About Badger'),
      
      div({ id: 'about-div' },
        div({ 'class': 'bio', id: 'company' },
          div({ id: 'logo' }, img({ src: 'images/v2/happybadger.png' })),
          h2("Domain management you'll enjoy."),
          p("Seriously, we make domains so easy that a first grader could do 'em!*"), 
          p("Domains effectively drive the entire internet, shouldn't they be easier to manage? We thought so, and thus, Badger was born! You shouldn't have to auction off your house and sacrifice your first born to transfer domains, you should be able to press a button that says \"Transfer Domain\" and be done with it. That is our philosophy, and we think you will appreciate it."),
          p("Stop letting domain registrars badger you, and start using... Badger!"),
          span({ style: 'font-size: 10px; text-align: right' }, '*Must be 18 or older. Sorry kids.')
        )
      )
    );
  });
  
}
