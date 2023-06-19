import { Twilio } from 'twilio';

const accountPhoneNumber = '14155238886'
const sid = 'ACd47c79b95de9ab37d21012417801695d';
const token = '098c5bdc4c3bb74c1f07378354b51ea4';
const client = new Twilio(sid, token);

export { client, accountPhoneNumber }
