import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    batchName: {
        type: String,
        required: false,
        trim: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: false
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    startDate: Date,
    endDate: Date,
    scheduleDays: [String],
    sessionTime: String,
    sessionTopic: String,
    session: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    totalStudents: {
        type: Number,
        default: 10
    },
    revenue: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;