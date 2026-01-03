import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';
import notFoundAnimation from '@/lottie/error_404.json';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <Lottie 
                animationData={notFoundAnimation} 
                loop={true} 
                style={{ width: '100%', maxWidth: '400px' }} 
            />
            <h1 className="text-4xl md:text-6xl font-bold mt-4">Page Not Found</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Oops! The page you are looking for does not exist or has been moved.
            </p>
            <Button asChild className="mt-8">
                <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go Back to Home
                </Link>
            </Button>
        </div>
    );
};

export default NotFound;