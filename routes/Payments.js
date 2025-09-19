const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payment");
const { auth, isInstructor, isStudent, isAdmin } = require("../middleware/auth");

// Capture Payment (protected route)
router.post("/capturePayment", auth,isStudent, capturePayment);

// Verify Signature (webhook, no auth)
router.post("/verifySignature", verifySignature);

module.exports = router;
