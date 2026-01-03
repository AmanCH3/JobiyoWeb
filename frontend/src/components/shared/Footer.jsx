import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
 return (
   <footer className="border-t bg-secondary/50">
     <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <div className="space-y-4">
           <h2 className="font-philosopher text-2xl font-bold">Jobiyo</h2>
           <p className="text-muted-foreground text-sm">
             Your next career move starts here. Connecting talent with opportunity.
           </p>
           <div className="flex space-x-4">
             <a href="https://www.facebook.com/nikeshpyaku" className="text-muted-foreground hover:text-primary">
               <Facebook />
             </a>
             <a href="http://github.com/nikeshpyakurel" className="text-muted-foreground hover:text-primary">
               <Github />
             </a>
             <a href="https://www.linkedin.com/in/nikeshpyakurel/" className="text-muted-foreground hover:text-primary">
               <Linkedin />
             </a>
           </div>
         </div>

         <div>
           <h3 className="font-semibold tracking-wider uppercase">For Job Seekers</h3>
           <ul className="mt-4 space-y-2">
             <li><Link to="/jobs" className="text-sm text-muted-foreground hover:text-primary">Browse Jobs</Link></li>
             <li><Link to="/companies" className="text-sm text-muted-foreground hover:text-primary">Browse Companies</Link></li>
             <li><Link to="/student/profile" className="text-sm text-muted-foreground hover:text-primary">Your Profile</Link></li>
             <li><Link to="/student/applications" className="text-sm text-muted-foreground hover:text-primary">My Applications</Link></li>
           </ul>
         </div>

         <div>
           <h3 className="font-semibold tracking-wider uppercase">For Recruiters</h3>
           <ul className="mt-4 space-y-2">
             <li><Link to="/recruiter/jobs/new" className="text-sm text-muted-foreground hover:text-primary">Post a Job</Link></li>
              <li><Link to="/recruiter" className="text-sm text-muted-foreground hover:text-primary">Dashboard</Link></li>
             <li><Link to="/login" className="text-sm text-muted-foreground hover:text-primary">Recruiter Login</Link></li>
           </ul>
         </div>

         <div>
           <h3 className="font-semibold tracking-wider uppercase">Company</h3>
           <ul className="mt-4 space-y-2">
             <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
             <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
             <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
           </ul>
         </div>
       </div>

       <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
         <p>© {new Date().getFullYear()} Jobiyo. All rights reserved.</p>
       </div>
     </div>
   </footer>
 );
}

export default Footer;