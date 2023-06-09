import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { UserWithMongoId } from '../types/types';
import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users-repositories/users.repository';
import { email } from '../auth-guards/constants';

//export const myPass = process.env.EMAIL;
//TODO переменная окружения

const myPass = email;

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'menthol.vegan@gmail.com', // generated ethereal user
    pass: myPass, // generated ethereal password
  },
});

@Injectable()
export class EmailsManager {
  constructor(protected usersRepository: UsersRepository) {}

  async sendEmailConfirmationMessage(
    userId: string,
    email: string,
    confirmationCode: string,
  ) {
    const html = `<h1>Thank you for registration!</h1><p>To finish registration process please follow the link below:<a href="https://somesite.com/confirm-email?code=${confirmationCode}">complete registration</a></p>`;

    return await transporter.sendMail({
      from: 'AnnaTestEmail', // sender address
      to: email, // list of receivers
      subject: 'Confirmation Message', // Subject line
      html: html,
    });
  }

  async resendEmailConfirmationMessage(foundUserByEmail: UserWithMongoId) {
    const generateConfirmationCode = uuidv4();
    const generateExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 2,
    });

    await this.usersRepository.updateConfirmationCode(
      foundUserByEmail._id.toString(),
      generateConfirmationCode,
      generateExpirationDate,
    );

    const html2 = `<h1>Thank you for registration!</h1><p>To finish registration process please follow the link below:<a href="https://somesite.com/confirm-email?code=${generateConfirmationCode}">complete registration</a></p>`;

    return await transporter.sendMail({
      from: 'AnnaTestEmail', // sender address
      to: foundUserByEmail.accountData.email, // list of receivers
      subject: 'Resend confirmation Message', // Subject line
      html: html2,
    });
  }

  async sendEmailPasswordRecovery(
    generatePassRecovCode: string,
    email: string,
  ) {
    const html = `<h1>Password recovery</h1
       <p>To finish password recovery please follow the link below: <a href="https://somesite.com/confirm-email?recoveryCode=${generatePassRecovCode}">complete registration</a></p>`;

    // send mail with defined transport object
    return await transporter.sendMail({
      from: 'AnnaTestEmail', // sender address
      to: email, // list of receivers
      subject: 'Password Recovery Message', // Subject line
      html: html,
    });
  }
}
