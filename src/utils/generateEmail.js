const Mailgen = require("mailgen");

const generateEmail = (intro, name, otp) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Zynopay",
      link: "https://mailgen.js/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  const email = {
    body: {
      name: name,
      intro: intro,
      action: {
        instructions:
          "Please use the verification code below to continue in the App",
        button: {
          color: "#22BC66", // Optional action button color
          text: `${otp}`,
          //   link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
        },
      },
      outro: "If you didn't request this, you can ignore this email.",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

module.exports = generateEmail;
