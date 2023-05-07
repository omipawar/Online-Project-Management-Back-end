const express = require("express");
const Project = require("../models/Project");
const { ObjectId } = require('mongodb');
const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        let body = req.body;
        let project = new Project();

        project.projectName = body.projectName;
        project.reason = body.reason;
        project.type = body.type;
        project.division = body.division;
        project.category = body.category;
        project.priority = body.priority;
        project.department = body.department;
        project.startDate = body.startDate;
        project.endDate = body.endDate;
        project.location = body.location;
        project.status = body.status;

        await project.save();
        res.send({ status: true, message: "New project added successfully" });
    } catch (err) {
        res.send({ status: false, message: err.message })
    }

});

router.get("/getprojects", async (req, res) => {
    try {
        let pageNo = Number(req.query.pageNo);
        let itemsPerPage = Number(req.query.limit);
        let skip = (pageNo * itemsPerPage) - itemsPerPage;

        let sortBy = { [req.query.sortby]: 1 };
        let search = req.query.searchText;

        let querry;
        let projects;
        let totalProjects;

        if (search) {

            querry = { projectName: { $regex: search, '$options': 'i' } }
            totalProjects = await Project.find(querry).count();

        } else if (pageNo && itemsPerPage && !search) {

            querry = {};
            totalProjects = await Project.find(querry).count();
        }

        projects = await Project.find(querry).sort(sortBy).skip(skip).limit(itemsPerPage);

        if (projects) {
            res.send({ status: true, data: projects, totalProjects });
        } else {
            res.send({ status: false, message: "No projects Found...!" })
        }
    } catch (err) {
        res.send({ status: false, message: err.message })
    }

});

router.post("/changeStatus", async (req, res) => {
    try {
        let body = req.body;
        let idToUpdate = body.id;
        let updatedStatus = body.status;
        let projects = new Project();
        projects = await Project.updateOne({ _id: new ObjectId(idToUpdate) }, { $set: { status: updatedStatus } });

        res.send({ status: true, data: projects });

    } catch (err) {
        res.send({ status: false, message: err.message });
    }
})

router.get("/projectStatusCount", async (req, res) => {
    try {
        let pipeline = [
            {
                "$facet": {
                    "totalProjects": [
                        { "$match": {} },
                        { "$count": "totalProjects" },
                    ],
                    "closed": [
                        { "$match": { "status": "Closed" } },
                        { "$count": "closed" }
                    ],
                    "running": [
                        { "$match": { "status": "Running" } },
                        { "$count": "running" }
                    ],
                    "cancelled": [
                        { "$match": { "status": "Cancelled" } },
                        { "$count": "cancelled" }
                    ],
                    "closureDelay": [
                        { "$match": { "status": "Running", "endDate": { $lt: new Date() } } },
                        { "$count": "closureDelay" }
                    ],
                }
            },
            {
                "$project": {
                    "totalProjects": { "$arrayElemAt": ["$totalProjects.totalProjects", 0] },
                    "closed": { "$arrayElemAt": ["$closed.closed", 0] },
                    "running": { "$arrayElemAt": ["$running.running", 0] },
                    "cancelled": { "$arrayElemAt": ["$cancelled.cancelled", 0] },
                    "closureDelay": { "$arrayElemAt": ["$closureDelay.closureDelay", 0] }
                }
            }
        ];
        let counts = await Project.aggregate(pipeline);
        res.send({ status: true, counts })
    } catch (err) {
        res.send({ status: false, message: err.message });
    }
});

router.get("/barGrahData", async (req, res) => {
    try {
        let pipeline = [
            {
                $group: {
                    _id: "$department",
                    registered: { $sum: 1 },
                    closed: {
                        $sum: {
                            "$cond": [
                                { "$eq": ["$status", "Closed"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]
        let barData = await Project.aggregate(pipeline);

        res.send({ status: true, data: barData })

    } catch (err) {
        res.send({ status: false, message: err.message });
    }
})

module.exports = router;