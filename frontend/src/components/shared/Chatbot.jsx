import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useSendChatQueryMutation } from "@/api/chatbotApi";
import { AnimatePresence, motion } from "framer-motion";

const ChatMessage = ({ role, text }) => (
   <div className={`flex items-start gap-3 my-3 ${role === 'user' ? 'justify-end' : ''}`}>
       {role === 'model' && <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0"><Bot className="h-5 w-5"/></div>}
       <div className={`p-3 rounded-lg max-w-xs md:max-w-md shadow-sm ${role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
           <p className="text-sm whitespace-pre-wrap">{text}</p>
       </div>
       {role === 'user' && <div className="p-2 rounded-full bg-muted/80 flex-shrink-0"><User className="h-5 w-5"/></div>}
   </div>
);

export const Chatbot = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [input, setInput] = useState('');
   const [history, setHistory] = useState([]);
   const [sendQuery, { isLoading }] = useSendChatQueryMutation();
   const scrollAreaRef = useRef(null);

   const handleSend = async () => {
       if (!input.trim()) return;
      
       const userMessage = { role: 'user', text: input };
       const newHistory = [...history, userMessage];
       setHistory(newHistory);
       setInput('');

       try {
           const res = await sendQuery({ query: input, history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })) }).unwrap();
           setHistory([...newHistory, { role: 'model', text: res.response }]);
       } catch (error) {
           setHistory([...newHistory, { role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
       }
   };

   // Auto-scroll logic
   useEffect(() => {
       if (isOpen && scrollAreaRef.current) {
           const viewport = scrollAreaRef.current.querySelector('div > div'); // Targeting the inner scrollable div
           if(viewport) {
               viewport.scrollTop = viewport.scrollHeight;
           }
       }
   }, [history, isOpen]);

   return (
       <>
           <div className="fixed bottom-6 right-6 z-[100]">
               <Button size="icon" className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Chatbot">
                   <AnimatePresence>
                       {isOpen ? <X className="h-7 w-7"/> : <MessageSquare className="h-7 w-7"/>}
                   </AnimatePresence>
               </Button>
           </div>

           <AnimatePresence>
               {isOpen && (
                   <motion.div
                       initial={{ opacity: 0, y: 20, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 20, scale: 0.95 }}
                       transition={{ duration: 0.2, ease: "easeInOut" }}
                       className="fixed bottom-24 right-6 z-50"
                   >
                       <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
                           <CardHeader className="flex-row items-center gap-3 bg-muted/50 border-b">
                               <Bot className="h-7 w-7 text-primary"/>
                               <div>
                                   <CardTitle>Jobiyo Helper</CardTitle>
                                   <p className="text-xs text-muted-foreground">AI Assistant</p>
                               </div>
                           </CardHeader>
                           <CardContent className="flex-grow overflow-hidden p-0">
                               <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                                   <ChatMessage role="model" text="Hello! How can I help you find a job or company on Jobiyo today?"/>
                                   {history.map((msg, i) => <ChatMessage key={i} {...msg} />)}
                                   {isLoading && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
                               </ScrollArea>
                           </CardContent>
                           <CardFooter className="border-t pt-4">
                               <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
                                   <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about jobs..." autoComplete="off" />
                                   <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                       <Send className="h-4 w-4"/>
                                   </Button>
                               </form>
                           </CardFooter>
                       </Card>
                   </motion.div>
               )}
           </AnimatePresence>
       </>
   );
};