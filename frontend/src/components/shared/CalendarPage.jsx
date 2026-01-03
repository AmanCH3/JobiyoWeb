import { useGetMyInterviewsQuery } from '@/api/interviewApi';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';

const locales = { 'en-US': require('date-fns/locale/en-US') };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarPage = () => {
    const { data: interviews, isLoading } = useGetMyInterviewsQuery();
    
    const events = interviews?.map(interview => ({
        title: `${interview.job.title} with ${interview.applicant.fullName}`,
        start: new Date(interview.date),
        end: new Date(interview.date), 
        allDay: true, 
        resource: interview, 
    })) || [];

    return (
        <div className="container mx-auto py-10 h-[80vh]">
            <h1 className="text-3xl font-bold mb-6">My Interview Calendar</h1>
            {isLoading ? <p>Loading...</p> : (
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                />
            )}
        </div>
    );
};

export default CalendarPage;