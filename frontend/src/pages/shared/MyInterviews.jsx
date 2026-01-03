import { useGetMyInterviewsQuery } from "@/api/interviewApi";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { useState } from "react";
import { Link } from "react-router-dom";
import {enUS} from 'date-fns/locale/en-US';


const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const MyInterviews = () => {
    const { data: interviews, isLoading, isError } = useGetMyInterviewsQuery();
    const user = useSelector(selectCurrentUser);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const events = interviews?.map(interview => {
        const [hours, minutes] = interview.time.split(':');
        const startDate = new Date(interview.date);
        startDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        return {
            title: user.role === 'student'
                ? `Interview: ${interview.application.job.title}`
                : `Interview: ${interview.student.fullName}`,
            start: startDate,
            end: endDate,
            resource: interview,
        };
    }) || [];

    if (isError) return <p className="text-destructive p-10">Failed to load interviews.</p>;

    return (
        <div className="container mx-auto py-10">
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Interview Details</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4">
                            <p><strong>Position:</strong> {selectedEvent.resource.application.job.title}</p>
                            <p><strong>{user.role === 'student' ? 'Recruiter' : 'Candidate'}:</strong> {user.role === 'student' ? selectedEvent.resource.recruiter.fullName : selectedEvent.resource.student.fullName}</p>
                            <p><strong>Date & Time:</strong> {format(selectedEvent.start, 'PPP p')}</p>
                            <p><strong>Type:</strong> <span className="capitalize">{selectedEvent.resource.interviewType}</span></p>
                            <div>
                                <strong>{selectedEvent.resource.interviewType === 'inoffice' ? 'Location:' : 'Meeting Link:'}</strong>
                                <p className="text-sm text-primary">{selectedEvent.resource.locationOrLink}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>My Interviews</CardTitle>
                    <CardDescription>View your upcoming and past interview schedules.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin"/></div>
                    ) : (
                        <div className="h-[70vh]">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                onSelectEvent={event => setSelectedEvent(event)}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyInterviews;