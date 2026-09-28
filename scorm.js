let scormAPI = null;
let scormInitialized = false;


/*
 * Find the SCORM 1.2 API provided by the LMS.
 */
function findSCORMAPI() {

    let currentWindow = window;

    while (currentWindow) {

        try {

            if (currentWindow.API) {
                return currentWindow.API;
            }

        } catch (error) {

            console.log(
                "Unable to access parent window."
            );

        }

        if (currentWindow.parent === currentWindow) {
            break;
        }

        currentWindow = currentWindow.parent;
    }

    return null;
}


/*
 * Initialise the SCORM session.
 */
function initializeSCORM() {

    scormAPI = findSCORMAPI();

    /*
     * When running with Live Server,
     * there is no Moodle SCORM API.
     */
    if (!scormAPI) {

        console.log(
            "SCORM API not found. Running outside Moodle."
        );

        return;
    }


    const result = scormAPI.LMSInitialize("");


    if (result === "true" || result === true) {

        scormInitialized = true;

        /*
         * Tell Moodle that the learner
         * has started the activity.
         */
        scormAPI.LMSSetValue(
            "cmi.core.lesson_status",
            "incomplete"
        );

        scormAPI.LMSCommit("");


        console.log(
            "SCORM initialized successfully."
        );

    } else {

        console.error(
            "SCORM initialization failed."
        );
    }
}


/*
 * Mark the SCORM activity as completed.
 */
function completeSCORM() {

    /*
     * If we're testing outside Moodle,
     * show a message but don't throw an error.
     */
    if (!scormInitialized) {

        console.log(
            "SCORM is not active. Running outside Moodle."
        );

        showCompletionMessage(
            "Test completed. Moodle completion will be recorded when this is uploaded as a SCORM activity."
        );

        return;
    }


    /*
     * Tell Moodle that the activity
     * has been completed.
     */
    const result = scormAPI.LMSSetValue(
        "cmi.core.lesson_status",
        "completed"
    );


    if (result !== "false") {

        scormAPI.LMSCommit("");

        showCompletionMessage(
            "Your mentor session has been completed."
        );

        disableCompletionButton();

        console.log(
            "SCORM activity marked as completed."
        );

    } else {

        console.error(
            "Unable to mark SCORM activity as completed."
        );
    }
}


/*
 * Display the completion message.
 */
function showCompletionMessage(message) {

    const messageElement =
        document.getElementById("completionMessage");

    if (messageElement) {
        messageElement.textContent = message;
    }
}


/*
 * Disable the completion button
 * after completion.
 */
function disableCompletionButton() {

    const button =
        document.getElementById("completeButton");

    if (button) {

        button.disabled = true;

        button.textContent =
            "Session Completed";
    }
}


/*
 * Finish the SCORM session when
 * the learner leaves the activity.
 */
function finishSCORM() {

    if (!scormInitialized || !scormAPI) {
        return;
    }


    try {

        scormAPI.LMSCommit("");

        scormAPI.LMSFinish("");

        scormInitialized = false;

        console.log(
            "SCORM session finished."
        );

    } catch (error) {

        console.error(
            "Error finishing SCORM session:",
            error
        );
    }
}


/*
 * Start SCORM when the page loads.
 */
window.addEventListener(
    "load",
    initializeSCORM
);


/*
 * Finish SCORM when the page closes.
 */
window.addEventListener(
    "beforeunload",
    finishSCORM
);