export interface Message {
  user: string;
  msg: string;
  timestamp: {
    nanoseconds: number;
    seconds: number;
  };
}
