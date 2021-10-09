export interface User{
    username: string;
    password: string;
    contact: [{
        firstName: string,
        middleName: string,
        lastName: string,
        email: string,
        mobile: number,
        landline: number,
        notes: string,
        date: Date 
    }];
  }