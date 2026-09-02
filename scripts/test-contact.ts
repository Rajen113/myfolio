import { contactSubmissionSchema } from "../lib/validations/contact";
import { isContactRateLimited } from "../lib/contact/rate-limit";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ Test passed: ${message}`);
  }
}

console.log("=== Running Contact & Leads System Unit Tests ===");

// 1. Valid Input Test
const validResult = contactSubmissionSchema.safeParse({
  username: "rajen",
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Project Inquiry",
  message: "I would like to hire you for a Next.js project.",
});
assert(validResult.success === true, "Valid contact submission passes validation");

// 2. Invalid Email Test
const invalidEmailResult = contactSubmissionSchema.safeParse({
  username: "rajen",
  name: "Jane Doe",
  email: "not-an-email",
  message: "Hello world",
});
assert(invalidEmailResult.success === false, "Invalid email format is rejected");

// 3. Oversized Message Test (> 5000 chars)
const oversizedMessageResult = contactSubmissionSchema.safeParse({
  username: "rajen",
  name: "Jane Doe",
  email: "jane@example.com",
  message: "a".repeat(5001),
});
assert(oversizedMessageResult.success === false, "Oversized message > 5000 chars is rejected");

// 4. Missing Required Fields
const missingNameResult = contactSubmissionSchema.safeParse({
  username: "rajen",
  name: "   ",
  email: "jane@example.com",
  message: "Hello",
});
assert(missingNameResult.success === false, "Empty whitespace name is rejected");

// 5. Optional Subject Transformation (empty string -> null)
const emptySubjectResult = contactSubmissionSchema.safeParse({
  username: "rajen",
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "   ",
  message: "Hello there!",
});
assert(
  emptySubjectResult.success === true && emptySubjectResult.data.subject === null,
  "Whitespace subject is transformed to null"
);

// 6. Rate Limiting Test (max 5 per 10 mins)
const testIp = "203.0.113.42";
let isLimited = false;
for (let i = 0; i < 6; i++) {
  isLimited = isContactRateLimited(testIp);
}
assert(isLimited === true, "Rate-limiter triggers after 5 rapid requests from same IP");

console.log("All Contact & Leads System Tests Passed Successfully! 🎉");
