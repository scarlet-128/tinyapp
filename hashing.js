const bcrypt = require('bcrypt');

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash('2345', salt, (err, hash) => {

    console.log(hash);

  });
});
