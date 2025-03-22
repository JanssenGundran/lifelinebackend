const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new job
router.post('/', async (req, res) => {
    try {
        const { title, description, maxHires } = req.body;
        if (!maxHires) return res.status(400).json({ message: "maxHires is required" });

        const newJob = new Job({
            title,
            description,
            maxHires,
            waitingList: [],
            hiredList: []
        });

        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Apply for a job
router.post('/:id/apply', async (req, res) => {
    try {
        const { name, email } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.hiredList.length >= job.maxHires) {
            return res.status(400).json({ message: 'Job already filled' });
        }

        // Add applicant to waiting list
        job.waitingList.push({ name, email });
        await job.save();

        // Return updated job information
        res.json({ message: 'Application received!', job });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hire an applicant
router.post('/:id/hire', async (req, res) => {
    try {
        const { name, email } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Find applicant in the waiting list by name and email
        const applicantIndex = job.waitingList.findIndex(app => app.name === name && app.email === email);
        if (applicantIndex === -1) {
            console.log(`Applicant ${name} (${email}) not found in the waiting list`);
            return res.status(400).json({ message: 'Applicant not found in waiting list' });
        }

        // Hire the applicant: Ensure the hiredApplicant has `name` and `email`
        const hiredApplicant = {
            name: job.waitingList[applicantIndex].name, 
            email: job.waitingList[applicantIndex].email,
            hiredAt: new Date() 
        };

        job.hiredList.push(hiredApplicant);

        // Remove the applicant from the waiting list
        job.waitingList.splice(applicantIndex, 1);

        // Save the updated job data
        await job.save();

        // Check if we have filled the job (i.e., hired enough applicants)
        if (job.hiredList.length >= job.maxHires) {
            await Job.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Job filled and deleted', job });
        }

        // Return updated job information after hiring
        res.json({ message: 'Applicant hired!', job });
    } catch (error) {
        console.error('Error hiring applicant:', error);
        res.status(500).json({ message: error.message });
    }
});


// Delete a job
router.delete('/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a job
router.put('/:id', async (req, res) => {
    try {
        const { title, description, maxHires } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { title, description, maxHires },
            { new: true, runValidators: true }
        );

        if (!updatedJob) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job updated", updatedJob });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
