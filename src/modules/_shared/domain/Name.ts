export class Name {
  private readonly name: string;

  static validate(name: string): boolean {
    if (name === undefined || name === null || name.length < 1 || name.length > 255) return false
    return true;
  }

  static create(name: string): Name {
    if (!this.validate(name)) throw new Error('Name is invalid');
    return new Name(name);
  }
  
  private constructor(name: string){
    this.name = name;
  }

  get value(): string {
    return this.name;
  }
}