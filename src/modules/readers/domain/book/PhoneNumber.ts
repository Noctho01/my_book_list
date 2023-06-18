export class PhoneNumber {
  private readonly phoneNumber: string;

  static validate(phoneNumber: string): boolean {
    if (
      phoneNumber === undefined
      || phoneNumber === null 
      || phoneNumber.length < 10 
      || phoneNumber.length > 17
    ) return false;
    return true;
  }

  static create(phoneNumber: string): PhoneNumber {
    if (!this.validate(phoneNumber)) throw new Error('PhoneNumber is invalid')
    return new PhoneNumber(phoneNumber);
  }

  private constructor(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  get value(): string {
    return this.phoneNumber;
  }
}