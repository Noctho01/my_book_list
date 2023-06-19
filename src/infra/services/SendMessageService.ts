import { client, accountPhoneNumber } from "../sdk/twilio";

export async function sendMessageService(toPhoneNumber: string, message: string): Promise<void> {
  await client.messages.create({
    from: `whatsapp:+${accountPhoneNumber}`,
    to: `whatsapp:+${toPhoneNumber}`,
    body: message
  }).then(() => {
    console.log('mensagem enviada!')
  });
}