const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// sgMail.send({
//     to: 'aayushupadhyay14@gmail.com',
//   from: 'aayushu13@gmail.com',
//   subject: 'First email ever',
//   text: 'Hi this is from aayush. get better!',
// })


const sendWelcomeEmail = (email, name)=>{

    sgMail.send({
        to: email,
        from: 'aayushu13@gmail.com',
        subject: 'Welcome to Task App',
        text: 'Hello '+name+"!\nWelcome to the task app. \nLet me know how you get along with the app",
    })
}

const sendCancellationEmail = (email, name)=>{

    sgMail.send({
        to: email,
        from: 'aayushu13@gmail.com',
        subject: 'Good Bye Fellow Task App User',
        text: 'HI '+name+"!\n We are sorry to hear you go. \nLet us know if we could have improved anything."
    })
}


module.exports= {
    sendWelcomeEmail,
    sendCancellationEmail

}
