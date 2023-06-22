export class Rating {
  private readonly raging: number;

  static validate(rating: number): boolean {
    if (
      rating === undefined
      || rating === null
      || typeof rating !== 'number' 
      || rating < 0 
      || rating > 5
    ) return false
    return true;
  }

  static create(rating: number): Rating {
    if (!this.validate(rating)) throw new Error('Rating is invalid');
    return new Rating(rating);
  }

  private constructor(rating: number) {
    this.raging = rating;
  }

  get value(): number {
    return this.raging;
  }
}