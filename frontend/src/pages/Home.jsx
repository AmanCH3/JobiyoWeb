import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Search, UserPlus, ArrowRight } from "lucide-react";
import heroAnimation from "@/lottie/splash_Screen.json";
import FeaturedJobs from "@/components/shared/FeaturedJobs";
import TopCompanies from "@/components/shared/TopCompanies";
import RealtimeSearch from "@/components/shared/RealtimeSearch";

const Home = () => {
 return (
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ duration: 0.5 }}
     className="space-y-20 md:space-y-32 my-10 md:my-16 overflow-x-hidden"
   >
     <section className="container mx-auto">
       <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
         <div className="text-center lg:text-left">
           <motion.h1
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
             className="text-4xl md:text-6xl font-bold tracking-tight"
           >
             Find The Job That <br />
             <span className="text-primary">Fits Your Life</span>
           </motion.h1>
           <motion.p
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.7, delay: 0.4 }}
             className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
           >
             Jobiyo is the #1 destination to find and list remote jobs and connect with top-tier companies worldwide.
           </motion.p>
           <motion.div
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.6 }}
             className="mt-8"
           >
             <RealtimeSearch/>
           </motion.div>
         </div>
         <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
           <Lottie animationData={heroAnimation} loop={true} style={{ maxWidth: '500px' }} />
         </motion.div>
       </div>
     </section>

     {/* How It Works Section */}
     <section className="container mx-auto">
       <div className="text-center space-y-3">
           <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
           <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">Getting started is simple. Follow these three easy steps to land your dream job.</p>
       </div>
       <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Added animation to cards */}
           {[
             { icon: <UserPlus size={32} />, title: "1. Create an Account", text: "Sign up as a job seeker or a recruiter and build your professional profile in minutes." },
             { icon: <Search size={32} />, title: "2. Search for a Job", text: "Browse through thousands of job listings with our advanced search and filtering tools." },
             { icon: <CheckCircle size={32} />, title: "3. Get Hired", text: "Apply for jobs, connect with recruiters, and get hired for your dream position." }
           ].map((item, index) => (
             <motion.div
               key={index}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: index * 0.2 }}
               viewport={{ once: true }}
             >
               <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                   <CardHeader>
                       <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
                           {item.icon}
                       </div>
                       <CardTitle className="mt-4">{item.title}</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <p className="text-muted-foreground">{item.text}</p>
                   </CardContent>
               </Card>
             </motion.div>
           ))}
       </div>
     </section>
     
     <FeaturedJobs />
     <TopCompanies />

   </motion.div>
 );
};

export default Home;