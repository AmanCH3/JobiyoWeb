import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;

    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;

    return score;
};

const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        setStrength(checkPasswordStrength(password));
    }, [password]);

    const getStrengthLabel = () => {
        switch (strength) {
            case 0:
            case 1:
            case 2:
                return 'Weak';
            case 3:
            case 4:
                return 'Medium';
            case 5:
                return 'Strong';
            default:
                return '';
        }
    };
    
    const label = getStrengthLabel();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-1.5 h-1.5">
                <div className={cn("flex-1 rounded-full", strength > 0 ? 'bg-red-500' : 'bg-muted')}></div>
                <div className={cn("flex-1 rounded-full", strength >= 3 ? 'bg-yellow-500' : 'bg-muted')}></div>
                <div className={cn("flex-1 rounded-full", strength >= 5 ? 'bg-green-500' : 'bg-muted')}></div>
            </div>
            {password && (
                <p className={cn(
                    "text-xs font-semibold",
                    label === 'Weak' && 'text-red-500',
                    label === 'Medium' && 'text-yellow-500',
                    label === 'Strong' && 'text-green-500',
                )}>
                    {label}
                </p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;