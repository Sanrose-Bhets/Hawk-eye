import { Transform } from 'class-transformer';

export function Lowercase() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
}
