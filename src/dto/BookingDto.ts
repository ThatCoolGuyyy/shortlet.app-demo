import { Type } from 'class-transformer';
import { IsDate, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'endDateAfterStartDate', async: false })
class EndDateAfterStartDate implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    const { object } = args;
    if (!(object instanceof CreateBookingDto)) {
      return false;
    }
    return value > object.startDate;
  }

  defaultMessage(): string {
    return 'endDate must be after startDate';
  }
}

export class CreateBookingDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @Validate(EndDateAfterStartDate)
  endDate!: Date;
}
