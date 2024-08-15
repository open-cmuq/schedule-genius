export function countsFor(course_number, audit) {
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
