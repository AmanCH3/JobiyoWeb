import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import sendEmail from "../utils/sendEmail.js";
import { format } from 'date-fns';

export const scheduleInterview = asyncHandler(async (req, res) => {
    const { applicationId, interviewType, date, time, locationOrLink } = req.body;
    
    if (!applicationId || !interviewType || !date || !time || !locationOrLink) {
        throw new ApiError(400, "All fields are required to schedule an interview.");
    }

    const recruiterId = req.user._id;

    const application = await Application.findById(applicationId).populate('applicant job');
    if (!application) throw new ApiError(404, "Application not found.");

    // Authorization: Check if the scheduler is the one who posted the job
    if(application.job.postedBy.toString() !== recruiterId.toString()){
        throw new ApiError(403, "You are not authorized to schedule an interview for this application.");
    }

    const interview = await Interview.create({
        application: applicationId,
        recruiter: recruiterId,
        student: application.applicant._id,
        interviewType,
        date,
        time,
        locationOrLink,
    });

    const student = application.applicant;
    const io = req.app.get("io");
    
    // Send real-time notification
    const notificationMessage = `Your interview for "${application.job.title}" has been scheduled. Please check your calendar.`;
    io.to(student._id.toString()).emit("notification", { message: notificationMessage });

    // Send email notification
    const formattedDate = format(new Date(date), 'MMMM d, yyyy');
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Interview Scheduled for ${application.job.title}</h2>
            <p>Hello ${student.fullName},</p>
            <p>An interview has been scheduled for you with one of our recruiters. We are excited to speak with you!</p>
            <h3>Interview Details:</h3>
            <ul>
                <li><strong>Date:</strong> ${formattedDate}</li>
                <li><strong>Time:</strong> ${time}</li>
                <li><strong>Type:</strong> <span style="text-transform: capitalize;">${interviewType}</span></li>
                <li><strong>${interviewType === 'inoffice' ? 'Location' : 'Meeting Link'}:</strong> ${locationOrLink}</li>
            </ul>
            <p>Please log in to your Jobiyo account to view all your scheduled interviews. Good luck!</p>
            <br/>
            <p>Best regards,</p>
            <p>The Jobiyo Team</p>
        </div>
    `;

    await sendEmail({
        email: student.email,
        subject: `Jobiyo - Your Interview is Scheduled!`,
        html: emailHtml,
    });

    return res.status(201).json(new ApiResponse(201, interview, "Interview scheduled successfully and notification sent."));
});

export const getMyInterviews = asyncHandler(async (req, res) => {
    const query = req.user.role === 'student'
        ? { student: req.user._id }
        : { recruiter: req.user._id };

    const interviews = await Interview.find(query)
        .populate({
            path: 'application',
            select: 'job',
            populate: {
                path: 'job',
                select: 'title company',
                populate: { path: 'company', select: 'name' }
            }
        })
        .populate('student', 'fullName profile')
        .populate('recruiter', 'fullName')
        .sort({ date: -1 });
        
    return res.status(200).json(new ApiResponse(200, interviews, "Interviews fetched successfully."));
});