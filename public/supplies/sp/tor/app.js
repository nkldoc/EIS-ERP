const cron = require('node-cron');
const express = require('express');
const fs = require('fs'); // previous example
const shell = require('shelljs'); // previous example
const nodemailer = require('nodemailer'); 
cron.schedule('0 0 0 0 0', function() {
  console.log('---------------------');
  console.log('Running Cron Job');

//  let messageOptions = {
//    from: 'your_demo_email_address@example.com',
//    to: 'eak.ibanez@gmail.com',
//    subject: 'Scheduled Email',
//    text: 'Hi there. This email was automatically sent by us.'
//  };
//
//  nodemailer.sendMail(messageOptions, function(error, info) {
//    if (error) {
//      throw error;
//    } else {
//      console.log('Email successfully sent!');
//    }
//  });
}); 
app.listen(3000);