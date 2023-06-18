import { Twilio } from 'twilio';

const accountPhoneNumber = '14155238886'
const sid = 'ACd47c79b95de9ab37d21012417801695d';
const token = '7249ee89dbc456e3c6feb0c04f9def3c';
const client = new Twilio(sid, token);

export { client, accountPhoneNumber }
