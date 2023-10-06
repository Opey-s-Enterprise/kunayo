const db = require('../routes/db');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => { // async added because of bcryt
    const {email,name, password: Npassword} = req.body
    if (!email || !Npassword || !name) return res.json({status: 'error', error: 'Complete all fields!'});
    else{
        db.query('select email from users_Info where email =?', [email], async(err, results) => {
            if (err) throw err;
            if (results[0]) return res.json({status: 'error', error: 'Email has already been registered!'})
            else{
                const password = await bcrypt.hash(Npassword, 14);
                db.query('insert into users_Info set ?', {email:email, password:password, fullName:name},(error, results) => {
                    if (error) throw error;
                    return res.json({status: 'success', success: 'You have been registered sucessfully, you can now login!'}) 
                })
            }
        })
    }
}
module.exports = signup;