export function welcomePin(name: string, pin: string, mobile: string): string {
  return `Welcome to SatyaSell, ${name}! Your account is ready. Username: ${mobile} (your mobile number). PIN: ${pin}. Please change your PIN after first login. Install the app: satyasell.com/install or login at satyasell.com/client/login - SatyaSell`;
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

export function customerEscalation(customerName: string, customerPhone: string, reason: string): string {
  return `ALERT: Customer ${customerName} (${customerPhone}) needs help. Issue: ${reason}. Please check your SatyaSell WhatsApp dashboard. - SatyaSell`;
}
