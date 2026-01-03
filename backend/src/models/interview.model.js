import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    interviewType: {
        type: String,
        enum: ['online', 'inoffice'],
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: { 
        type: String,
        required: true,
    },
    locationOrLink: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'canceled'],
        default: 'scheduled'
    }
}, { timestamps: true });

export const Interview = mongoose.model("Interview", interviewSchema);