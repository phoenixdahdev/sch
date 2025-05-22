export class PaystackUtils {
    static convertToKobo(amount: number): number {
        return Math.round(amount * 100);
    }

    static convertFromKobo(amount: number): number {
        return amount / 100;
    }

    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static generateReference(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `TXN_${timestamp}_${random}`.toUpperCase();
    }

    static formatCurrency(amount: number, currency: string = 'NGN'): string {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
        });
        return formatter.format(amount);
    }

    static isSuccessfulTransaction(status: string): boolean {
        return status === 'success';
    }

    static getTransactionStatusMessage(status: string): string {
        const statusMessages = {
            success: 'Transaction successful',
            failed: 'Transaction failed',
            abandoned: 'Transaction abandoned by user',
            pending: 'Transaction pending',
        };
        return statusMessages[status as keyof typeof statusMessages] || 'Unknown transaction status';
    }
}