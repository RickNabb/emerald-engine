/**
* mailer.js
* (C) Yes And Games 2016
* Nick Rabb <nrabb@outlook.com>
* <yesandgames@gmail.com>
* An interface to hold emailing functions.
*/

/*jslint node:true */
'use strict';

// VARIABLES
// ================================
var nodemailer = require('nodemailer');
var fs = require('fs');

var smtpConfig;
var transporter;

// FUNCTIONS
// ================================

/**
 * getConnection - Get a connection to the email service.
 *
 * @param  {function} callback  Code to run when the connection is valid
 */
function getConnection(callback) {
    fs.readFile('./resources/data/mailer-info.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        smtpConfig = JSON.parse(data);
        transporter = nodemailer.createTransport(smtpConfig);
        callback();
    });
}

/**
 * sendEmailFromUrl - Send an email that gets its HTML body from a URL.
 *
 * @param  {string} recipient     The recipient's email address.
 * @param  {string} subject       The subject of the email.
 * @param  {string} bodyPlainText The plain text body of the email.
 * @param  {string} bodyURL       The URL to read the HTML body of the email from.
 */
function sendEmailFromUrl(recipient, subject, bodyPlainText, bodyURL) {
    if (transporter === 'undefined') {
        getConnection(function () {
            transporter.sendMail({
                from: 'noreply.yesandgames@gmail.com',
                to: recipient,
                subject: subject,
                text: bodyPlainText,
                html: {path: bodyURL}
            });
        });
    } else {
        transporter.sendMail({
            from: 'noreply.yesandgames@gmail.com',
            to: recipient,
            subject: subject,
            text: bodyPlainText,
            html: {path: bodyURL}
        });
    }
}

/**
 * sendEmail - Send an email.
 *
 * @param  {string} recipient     The recipient's email address.
 * @param  {string} subject       The subject of the email.
 * @param  {string} bodyPlainText The plain text body of the email.
 * @param  {string} bodyHtml      The HTML body of the email.
 */
function sendEmail(recipient, subject, bodyPlainText, bodyHtml) {
    if (transporter === undefined) {
        getConnection(function () {
            transporter.sendMail({
                from: 'noreply.yesandgames@gmail.com',
                to: recipient,
                subject: subject,
                text: bodyPlainText,
                html: bodyHtml
            }, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    } else {
        transporter.sendMail({
            from: 'noreply.yesandgames@gmail.com',
            to: recipient,
            subject: subject,
            text: bodyPlainText,
            html: bodyHtml
        }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
}

// EXPORTS
// ================================

exports.sendEmailFromUrl = sendEmailFromUrl;
exports.sendEmail = sendEmail;
