module.exports = {

    'facebookAuth': {
        'clientID': '171986543489907', // your App ID
        'clientSecret': 'e8a8cb5fae1ab7e65d1d12e4460cd3da', // your App Secret
        'callbackURL': 'https://hansudung.com/auth/facebook/callback'
    },
    'googleAuth' : {
        'clientID': '923104700189-8qhevho1uecg0b0tscsnu5trrb3g8ghn.apps.googleusercontent.com',
        'clientSecret': 'UE8TcAVsNQhgSkoQ5IBfZXZk',
        'callbackURL': 'https://hansudung.com/auth/google/callback'
    }
};

$('#searchValue').submit(function () {
      var keySearch = $('#inputKey').val();
      console.log(keySearch)
      if (keySearch) {
         $(this).attr('action', '/search/results=' + keySearch);
      }
     
   });