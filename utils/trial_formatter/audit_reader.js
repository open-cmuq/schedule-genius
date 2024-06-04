const fs = require('fs');

// Read JSON file, fs is only required since we're reading a local file rather 
// than using the fetch API
const rawdata = fs.readFileSync('./cs-audit.json');
const auditData = JSON.parse(rawdata);

const countsfor_map = {
};

const countsfor_kill = new Set([
]);

function countsFor(course_number, audit) {
    let include_course = new Set(
        audit.filter(
            row => row.Type === "Course" && row["Course or code"] === course_number && row["Inclusion/Exclusion"] === "Inclusion"
        ).map(row => row.Requirement)
    );

    let include_code = new Set(
        audit.filter(
            row => row.Type === "Code" && row["Course or code"] === course_number.slice(0, 2) && row["Inclusion/Exclusion"] === "Inclusion"
        ).map(row => row.Requirement)
    );

    let exclude_course = new Set(
        audit.filter(
            row => row.Type === "Course" && row["Course or code"] === course_number && row["Inclusion/Exclusion"] === "Exclusion"
        ).map(row => row.Requirement)
    );

    let intersection = [...include_course].filter(req => exclude_course.has(req));
    if (intersection.length > 0) {
        throw new Error("Course cannot be included and excluded for the same requirement");
    }

    let counts_for = new Set([...include_course, ...include_code].filter(req => !exclude_course.has(req)));

    return counts_for;
}

function countsForCS(course_number, audit) {
    let counts_for = countsFor(course_number, audit);
    console.log(course_number, counts_for);

    let new_set = new Set();
    counts_for.forEach(item => {
        if (countsfor_kill.has(item)) {
            return;
        }

        if (item in countsfor_map) {
            new_set.add(countsfor_map[item]);
        } else {
            new_set.add(item);
            console.warn("Warning: Unknown requirement:", course_number, item);
        }
    });

    return new_set;
}

let course_number = "70-417";
let result = countsForCS(course_number, auditData);
console.log(result);
