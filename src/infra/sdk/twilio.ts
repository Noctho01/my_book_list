import { Twilio } from 'twilio';

const accountPhoneNumber = '14155238886'
const sid = 'ACd47c79b95de9ab37d21012417801695d';
const token = 'd7b223de216428262b296d4c8489a247';
const client = new Twilio(sid, token);

export { client, accountPhoneNumber }
