export function welcomePin(name: string, pin: string): string {
  return `Welcome to SatyaSell, ${name}! Your login PIN is: ${pin}. Login at satyasell.com/client/login - SatyaSell`;
}

export function otpLogin(otp: string): string {
  return `Your SatyaSell login OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone. - SatyaSell`;
}

export function pinChanged(): string {
  return `Your SatyaSell PIN has been changed successfully. If you did not make this change, contact support immediately. - SatyaSell`;
}

export function newOrder(orderNumber: string, customerName: string, total: number, itemCount: number): string {
  return `New Order! ${orderNumber} from ${customerName} - ${itemCount} item(s), Total: Rs.${total.toFixed(2)}. Check your SatyaSell dashboard for details. - SatyaSell`;
}
