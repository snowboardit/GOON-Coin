
// User selection dropdown
$('.ui.selection.dropdown').dropdown({
    clearable: true
  });

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
        }
      }
    })
});