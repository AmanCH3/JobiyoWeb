import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    subject: z.string().min(5, "Subject must be at least 5 characters."),
    message: z.string().min(20, "Message must be at least 20 characters long."),
});

const Contact = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Contact Form Data:", data);
        toast.success("Message sent! We'll get back to you soon.");
        reset();
    };

    return (
        <div className="py-12 md:py-20">
            <div className="container mx-auto">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Get In Touch</h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Have a question or a proposal? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold">Contact Information</h2>
                        <div className="flex items-start gap-4">
                            <Mail className="h-6 w-6 mt-1 text-primary"/>
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <a href="mailto:support@Jobiyo.com" className="text-muted-foreground hover:text-primary">support@Jobiyo.com</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="h-6 w-6 mt-1 text-primary"/>
                            <div>
                                <h3 className="font-semibold">Phone</h3>
                                <p className="text-muted-foreground">+977 980 000 0000</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 mt-1 text-primary"/>
                            <div>
                                <h3 className="font-semibold">Office</h3>
                                <p className="text-muted-foreground">123 Tech Street, Kathmandu, Nepal</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 border rounded-lg shadow-sm">
                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" {...register("fullName")} />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" {...register("subject")} />
                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" rows={5} {...register("message")} />
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;