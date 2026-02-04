import { 
    validatePasswordPolicy 
} from './src/utils/passwordUtils.js';

const user = {
    fullName: "John Doe Smith"
};

console.log('--- Testing Refined Password Policy ---');
console.log('Valid (8 chars):', validatePasswordPolicy('Abcdef1!', user));
console.log('Invalid (7 chars):', validatePasswordPolicy('Abcde1!', user));
console.log('Contains Name (John):', validatePasswordPolicy('MyNameIsJohn1!', user));
console.log('Contains Name (Smith):', validatePasswordPolicy('SmithPassword1!', user));
console.log('No Name match:', validatePasswordPolicy('SecurePass1!', user));
console.log('Valid Complex:', validatePasswordPolicy('CorrectHorseBatteryStaple1!', user));
