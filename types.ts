
export interface LifeData {
  age: number;
  country: string;
  gender: 'male' | 'female' | '';
}

export interface ExpectancyResult {
  expectancy: number;
  yearsLeft: number;
  monthsLeft: number;
  weeksLeft: number;
  daysLeft: number;
  hoursLeft: number;
  summersLeft: number;
  weekendsLeft: number;
  birthdaysLeft: number;
  totalWeeks: number;
  weeksLived: number;
  percentLived: number;
  sourceUrls: Array<{ uri: string; title: string }>;
}


