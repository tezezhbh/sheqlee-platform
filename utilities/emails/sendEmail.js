const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const createTransporter = require('./transport');

const loadTemplate = (templateName) => {
  const templatePath = path.join(
    __dirname,
    'templates',
    `${templateName}.html`
  );
  return fs.readFileSync(templatePath, 'utf-8');
};

const sendEmail = async ({ to, subject, html, template, variables }) => {
  try {
    let emailHTML = html;

    // Load template ONLY if provided
    if (template) {
      let templateHTML = loadTemplate(template);

      if (variables) {
        Object.keys(variables).forEach((key) => {
          templateHTML = templateHTML.replace(
            new RegExp(`{{${key}}}`, 'g'),
            variables[key]
          );
        });
      }

      emailHTML = templateHTML;
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: emailHTML,
    });
  } catch (err) {
    console.error('EMAIL ERROR 💥', err);
    throw err;
  }
};

module.exports = sendEmail;

// const loadTemplate = (templateName, variables = {}) => {
//   let template = fs.readFileSync(
//     path.join(__dirname, 'templates', templateName),
//     'utf-8'
//   );

//   Object.keys(variables).forEach((key) => {
//     template = template.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
//   });

//   return template;
// };

// const sendEmail = async ({ to, subject, template, variables }) => {
//   const transporter = createTransporter();

//   const baseTemplate = loadTemplate('base.html', {
//     YEAR: new Date().getFullYear(),
//   });

//   const contentTemplate = loadTemplate(template, variables);

//   const html = baseTemplate.replace('{{CONTENT}}', contentTemplate);

//   await transporter.sendMail({
//     from: `Sheqlee <${process.env.EMAIL_FROM}>`,
//     to,
//     subject,
//     html,
//   });
// };

// module.exports = sendEmail;
