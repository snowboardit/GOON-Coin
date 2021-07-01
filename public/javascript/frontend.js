$(document)
.ready(function() {
  $('.ui.form')
    .form({
      fields: {
        user: {
          identifier  : 'user',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please select a goon'
            }
          ]
        },
        amount: {
          identifier  : 'amount',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter an amount'
            }
          ]
        },
        sending_user: {
          identifier  : 'sending_user',
        }
      }
    }
  )

  // User selection dropdown
  $('.ui.selection.dropdown').dropdown({
    clearable: true
  });
  
  $('button[type="submit"]').click(function(e) {
    return $('.form').form('validate form');
  });
  
});