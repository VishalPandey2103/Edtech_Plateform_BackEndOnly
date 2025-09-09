const nodeMailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email,title,body)=>{
    try{
        let transporter = nodeMailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from:"StudyNotion | Vishal ",
            to:`${email}`,
            html:`${body}`,
            subject:`${title}`,
        })

        console.log(info);
        return info;
    }
    catch(error){
        console.log(error);
    }
}

// this is has been created so that OTP can be send trough utlizing this

module.exports = mailSender; 