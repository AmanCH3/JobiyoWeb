import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Search, 
  UserPlus, 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  Users, 
  TrendingUp,
  Star
} from "lucide-react";
import FeaturedJobs from "@/components/shared/FeaturedJobs";
import TopCompanies from "@/components/shared/TopCompanies";
import RealtimeSearch from "@/components/shared/RealtimeSearch";

const Home = () => {
  const stats = [
    { icon: <Briefcase className="h-5 w-5" />, value: "10,000+", label: "Active Jobs" },
    { icon: <Building2 className="h-5 w-5" />, value: "500+", label: "Companies" },
    { icon: <Users className="h-5 w-5" />, value: "50,000+", label: "Job Seekers" },
    { icon: <TrendingUp className="h-5 w-5" />, value: "95%", label: "Success Rate" },
  ];

  const steps = [
    { 
      icon: <UserPlus size={28} />, 
      title: "Create Your Profile", 
      text: "Sign up and build a professional profile that showcases your skills and experience.",
      color: "bg-blue-500/10 text-blue-600"
    },
    { 
      icon: <Search size={28} />, 
      title: "Discover Opportunities", 
      text: "Browse thousands of curated job listings with our smart search and filtering tools.",
      color: "bg-emerald-500/10 text-emerald-600"
    },
    { 
      icon: <CheckCircle size={28} />, 
      title: "Land Your Dream Job", 
      text: "Apply with one click, track your applications, and get hired by top companies.",
      color: "bg-purple-500/10 text-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      text: "Jobiyo helped me find my dream job at a top tech company. The platform is intuitive and the job recommendations were spot-on!"
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Meta",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      text: "The best job portal I've ever used. Within two weeks of signing up, I had multiple interviews lined up."
    },
    {
      name: "Emily Davis",
      role: "UX Designer at Spotify",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "Clean interface, great job matches, and excellent support. Highly recommend to anyone job hunting!"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Star className="h-4 w-4 fill-current" />
                <span>#1 Job Portal in Nepal</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
              >
                Find Your Next
                <br />
                <span className="text-gradient">Career Opportunity</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
              >
                Connect with top companies, discover exciting opportunities, 
                and take the next step in your professional journey with Jobiyo.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <RealtimeSearch />
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-primary mb-1">
                      {stat.icon}
                      <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Real Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Image */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team collaboration"
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                
                {/* Floating Card 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -left-8 top-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 flex items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Application Sent!</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -right-4 bottom-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">+2.5k hired</span>
                  </div>
                  <p className="font-semibold text-sm">Join successful candidates</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Your Journey to Success
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Three simple steps to land your dream job and start your new career adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-full border-0 shadow-lg hover-lift bg-card">
                  <div className="absolute -top-4 left-6">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <CardHeader className="pt-8">
                    <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <FeaturedJobs />

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Success Stories
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Hear from professionals who found their dream careers through Jobiyo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <TopCompanies />

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-20 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                Join thousands of professionals who have found their dream careers through Jobiyo. 
                Your next opportunity is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/jobs">
                  <Button size="lg" variant="secondary" className="text-primary font-semibold px-8">
                    Browse Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;