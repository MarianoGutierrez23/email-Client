document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

 
  document.querySelector('#send-btn').addEventListener('click', send_email);
  

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  
  load_emails(mailbox);
}

function send_email() {

  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
  
  
}

function load_emails(mailbox) {

  let prefix = '/emails/';
  let url = prefix.concat(mailbox);

  fetch(url)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    const limit = Object.keys(emails).length;
    
    for (let i = 0; i < limit; i++) {
      const mail = document.createElement('div');
      // add event listener 
      mail.addEventListener('click', () => see_email(emails[i].id, mailbox));
      

      if (emails[i].read === true) {
        mail.className = 'row border p-2 bg-secondary';
      }
      else {
        mail.className = 'row border p-2';
      }
      

      const person = document.createElement('div');

      if (emails[i].read === true) {
        person.className = "col-lg-2 col-md-3 col-sm-12 text-white";
      }
      else {
        person.className = "col-lg-2 col-md-3 col-sm-12";
      }
      
      if ( mailbox === 'inbox') {
        person.innerHTML = emails[i].sender;
      }
      else {
        if (emails[i].recipients.length > 1) {
          const rest = emails[i].recipients.length - 1;
          person.innerHTML = emails[i].recipients[0] + ' + ' + rest + ' more';
        }
        else{
          person.innerHTML = emails[i].recipients;
        }
        
      }

      mail.append(person);


      const subject = document.createElement('div');

      if (emails[i].read === true) {
        subject.className = 'col text-white';
      }
      else {
        subject.className = 'col';
      }

      
      subject.innerHTML = emails[i].subject;
      
      mail.append(subject);

      const time = document.createElement('div');

      if (emails[i].read === true) {
        time.className = 'col text-right text-white';
      }
      else {
        time.className = 'col text-right text-muted';
      }
      
      time.innerHTML = emails[i].timestamp;

      mail.append(time)


      // finish loading
      document.querySelector('#emails-view').append(mail);
    }



  });



}

function see_email(id, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // clear view

  document.querySelector('#email-view').innerHTML = '';

  let prefix = '/emails/';
  let url = prefix.concat(id);

  const card = document.createElement('div');
  card.className = 'card';

  const header = document.createElement('div');
  header.className = 'card-header';
  card.append(header);

  const card_body = document.createElement('div');
  card_body.className = 'card-body';
  card.append(card_body);

  const card_title = document.createElement('h5');
  card_title.className = 'card-title';
  card_body.append(card_title);

  const text = document.createElement('p');
  text.className = 'card-text';
  card_body.append(text);

  fetch(url)
  .then(response => response.json())
  .then(email => {
    // aux rows
    const row_1 = document.createElement('div');
    row_1.className = 'row';
    header.append(row_1);

    const row_2 = document.createElement('div');
    row_2.className = 'row';
    header.append(row_2);


    const sender = document.createElement('div');
    sender.className = 'col';
    row_1.append(sender);
    sender.innerHTML = 'From: ' + email.sender;

    const timestamp = document.createElement('div');
    timestamp.className = 'col text-right text-muted';
    row_1.append(timestamp);
    timestamp.innerHTML = email.timestamp

    const recipients = document.createElement('div');
    recipients.className = 'col';
    row_2.append(recipients);
    recipients.innerHTML = 'To: ' + email.recipients;

    card_title.innerHTML = email.subject;
    text.innerHTML = email.body;

    document.querySelector('#email-view').append(card);


    // space for buttons
    const breaker = document.createElement('br');
    document.querySelector('#email-view').append(breaker);

    const btn_row = document.createElement('div');
    btn_row.className = 'row';
    document.querySelector('#email-view').append(btn_row);


    if (email.read === false) {
      mark_as_read(id)
    }

    const reply_btn_div = document.createElement('div');
    reply_btn_div.className = 'col';
    btn_row.append(reply_btn_div)

    const reply_btn = document.createElement('button');
    reply_btn.className = 'btn btn-primary';
    reply_btn.innerHTML = 'Reply';
    reply_btn_div.append(reply_btn);
    reply_btn.addEventListener('click', () => reply(id,mailbox));


    if (mailbox === 'inbox') {

      const archive_btn_div = document.createElement('div');
      archive_btn_div.className = 'col text-right';
      btn_row.append(archive_btn_div);

      const archive_btn = document.createElement('button');
      archive_btn.className = 'btn btn-warning';
      archive_btn.innerHTML = 'Archive';
      archive_btn_div.append(archive_btn);

      archive_btn.addEventListener('click', () => archive(id,mailbox));

    }

    if (mailbox === 'archive') {

      const archive_btn_div = document.createElement('div');
      archive_btn_div.className = 'col text-right';
      btn_row.append(archive_btn_div);

      const archive_btn = document.createElement('button');
      archive_btn.className = 'btn btn-secondary';
      archive_btn.innerHTML = 'Unarchive';
      archive_btn_div.append(archive_btn);

      archive_btn.addEventListener('click', () => archive(id,mailbox));

    }



  });

}

function mark_as_read(id) {

  let prefix = '/emails/';
  let url = prefix.concat(id);

  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(id,mailbox) {
  let prefix = '/emails/';
  let url = prefix.concat(id);
  
  //archive
  if (mailbox === 'inbox'){
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(result => {
      load_mailbox('inbox')
    });
  }


  //unarchive
  if (mailbox === 'archive'){
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(result => {
      load_mailbox('inbox')
    });
  }
  
}

function reply(id, mailbox) {
  compose_email()

  let prefix = '/emails/';
  let url = prefix.concat(id);

  fetch(url)
  .then(response => response.json())
  .then(email => {
    
    
    // pre fill subject
    if (email.subject.length < 3) {
      document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
    }

    if (email.subject[0]+email.subject[1]+email.subject[2] === 'Re:') {
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
    }

    // check mailbox
    if (mailbox === 'sent') {

      document.querySelector('#compose-recipients').value = email.recipients.join(',');
    
    }
    else {
      document.querySelector('#compose-recipients').value = email.sender;
    }

    // pre fill body
    document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote:\n' + email.body + '\n' + '\n';

  });
   
}