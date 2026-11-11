# Veganfarmmovement

BUILD A FULLY AUTOMATED VEGANFARM ANIMAL RESCUE CROWDFUNDING PLATFORM

Build a real, production-quality, fully functional animal rescue crowdfunding website for VEGANFARM.

This is NOT just a design mockup.

The system must have a professional public donation page, real working donation submission workflow, case management, image uploads, QR-code donation support, donor submission records, automatic calculations, and an admin dashboard.

The final website must look professional, realistic, trustworthy, modern, clean and credible, while accurately stating that VEGANFARM is currently an independent, unregistered animal-welfare movement.

IMPORTANT — ASSETS ATTACHED TO THIS PROMPT

I will attach:

VEGANFARM official logo

VEGANFARM donation/payment QR code

Use the actual uploaded assets.

DO NOT:

Redesign the logo

Generate a fake logo

Generate a fake QR code

Replace the QR code with a placeholder

Modify the payment details encoded in the QR code

Invent a payment account

Invent bank details

Use the uploaded logo exactly and preserve its proportions.

Use the uploaded QR code exactly as provided.

The QR code must remain sharp and scannable.

1. TECHNOLOGY

Build this as a real web application.

Use a modern production-ready stack appropriate for Lovable.

The architecture should support:

Frontend

Database

Authentication

File/image storage

Admin dashboard

Donation submissions

Rescue case management

QR-code management

Donation tracking

Automatic fundraising calculations

Use secure architecture and environment variables for secrets.

Never expose private API keys or service credentials in frontend code.

2. PUBLIC WEBSITE

Create a clean public VEGANFARM website.

The main page should have:

Header

Centered VEGANFARM logo.

Navigation:

Home

Rescue Cases

How It Works

Transparency

About VEGANFARM

On mobile use a clean mobile menu.

3. HERO

Large heading:

HELP SAVE A LIFE

Subheading:

Every contribution can help an animal receive the care it needs.

Supporting text:

Support individual rescue cases and help provide treatment, medical care and emergency support.

Primary button:

VIEW RESCUE CASES

Secondary button:

HOW IT WORKS

4. RESCUE CASE SYSTEM

Create a real database-driven rescue case system.

Each case must have:

Case ID

Animal name

Animal type

Animal photo

Rescue poster

Medical bill / estimate

Description

Location

Amount required

Amount raised

Amount remaining

QR code

Case status

Created date

Last updated date

Possible case statuses:

Active

Treatment Ongoing

Funding Complete

Recovery

Closed

Do not invent case information.

5. RESCUE CASE PAGE

Every animal should have its own dedicated URL.

Example:

/rescue/case-name

The page should dynamically load that case's information.

Display:

HELP SAVE A LIFE

Animal Photo

Large, professional image.

Then a gallery containing:

Animal photo

Rescue case poster

Medical bill / estimate

6. CASE DESCRIPTION

Display:

ABOUT THIS CASE

Show the factual case description entered by the administrator.

Do not automatically generate medical claims.

The admin controls the content.

7. FUNDING INFORMATION

Create a prominent funding card.

Display:

AMOUNT REQUIRED

₹[amount]

AMOUNT RAISED

₹[amount]

AMOUNT REMAINING

₹[amount]

Automatically calculate:

Amount Remaining = Amount Required - Amount Raised

Automatically calculate:

Funding Percentage = Amount Raised / Amount Required × 100

Display a professional progress bar.

Never manually type the percentage.

Never allow the percentage to exceed 100%.

8. REAL DONATION FLOW

Create a complete donation workflow.

The donor should:

Open the animal's case.

Read the case information.

See the fundraising requirement.

Scan the official VEGANFARM QR code.

Make payment using their preferred supported payment method.

Return to the website.

Enter their donation amount.

Enter donor name.

Enter mobile number.

Enter UTR/payment reference.

Upload payment screenshot.

Submit the donation.

Receive confirmation.

9. QR CODE

Use the REAL QR CODE I ATTACHED.

Section:

SUPPORT THIS ANIMAL

Text:

You can contribute any amount you wish. Every contribution can help provide the care this animal needs.

Then:

SCAN TO DONATE

Display the uploaded QR code prominently.

Below it:

After completing your payment, enter your payment details below so the donation can be recorded against this rescue case.

Do not generate a fake payment confirmation.

10. DONATION AMOUNT

Create:

ENTER YOUR DONATION AMOUNT

Input:

₹ [Enter amount]

There must be NO fixed amount.

The donor can enter any positive amount.

Examples must NOT be shown as preset buttons.

Do not create:

₹100
₹500
₹1,000
₹2,000

unless I specifically add them later.

11. DONOR FORM

Create a professional form.

Fields:

Donor Name

Required.

Mobile Number

Required.

Donation Amount

Required.

Must be a positive INR amount.

Payment Reference / UTR

Required.

Upload Payment Screenshot

Required.

Allowed:

JPG

JPEG

PNG

WEBP

PDF

Show upload progress and selected filename.

12. DONATION STATUS

Every donation submission must have a status.

Possible statuses:

Pending Verification

Verified

Rejected

Default:

Pending Verification

IMPORTANT:

Do not automatically mark a donation as verified simply because the donor submitted a screenshot.

Only an authorized administrator can mark a donation as verified.

13. AUTOMATIC FUNDRAISING CALCULATION

Only verified donations should increase the public:

Amount Raised

Do not count rejected donations.

Pending donations should not be included in the public total unless the admin explicitly enables that feature.

When an administrator verifies a donation:

Automatically update:

Amount Raised

Amount Remaining

Funding Percentage

Progress Bar

Donation Count

14. DONATION RECORD

Each donation should create a database record containing:

Donation ID

Case ID

Donor name

Mobile number

Donation amount

UTR/payment reference

Screenshot URL

Submission timestamp

Verification status

Admin verification timestamp

Admin notes

Do not expose donor mobile numbers publicly.

Do not expose UTR publicly.

Do not expose payment screenshots publicly.

15. ADMIN DASHBOARD

Create a secure admin dashboard.

Admin login must be required.

The dashboard should include:

Dashboard

Display:

Total active cases

Total amount required

Total verified donations

Total pending donations

Total completed cases

16. CASE MANAGEMENT

Admin can:

Create case

Edit case

Delete/archive case

Activate/deactivate case

Upload animal photo

Upload rescue poster

Upload medical bill

Edit description

Edit location

Set amount required

Upload/update QR code

Change case status

All changes should automatically update the public website.

17. DONATION MANAGEMENT

Admin should see:

| Donor | Case | Amount | UTR | Status | Date | Action |

Actions:

VIEW

VERIFY

REJECT

When clicking VIEW, show the complete submission securely.

18. VERIFICATION

When admin clicks:

VERIFY DONATION

Show confirmation:

Are you sure you want to verify this donation?

Then:

CONFIRM VERIFICATION

After confirmation:

Donation status becomes Verified

Amount Raised updates automatically

Amount Remaining updates automatically

Progress bar updates automatically

Donation count updates automatically

19. REJECT DONATION

Admin can reject a submission.

Require an optional admin reason.

Example:

Payment reference could not be verified.

Rejected donations must not increase the public fundraising total.

20. DONOR CONFIRMATION

After donor submits valid information:

Show:

THANK YOU SO MUCH

Your donation details have been submitted successfully.

Then:

Your contribution has been recorded and is currently pending verification.

Do NOT say:

"Payment verified"

unless it has actually been verified.

Then:

Because of your kindness, we can give animals like this a chance to survive, heal and live.

Your help truly matters.

VEGANFARM

For Animals. For Life.

21. DONATION RECEIPT / REFERENCE

After submission generate a unique:

Donation Reference ID

Example format:

VF-DON-2026-000001

Do not reuse IDs.

Show the donor their reference ID after submission.

The donor should be able to keep this reference for future communication.

If technically feasible, provide a printable/downloadable confirmation.

Do not call it a tax receipt or 80G receipt.

22. EMAIL NOTIFICATIONS

If an email service is properly configured, support:

Donor

Send confirmation that their donation details were submitted.

Admin

Notify the administrator when a new donation is submitted.

After verification

Optionally notify the donor that their donation has been verified.

Do not claim email delivery if email integration is not actually configured.

23. SECURITY

Implement proper security.

Admin functionality must never be publicly accessible.

Use:

Authentication

Authorization

Secure database rules

Protected admin routes

Protected uploaded documents

Input validation

File type validation

File size limits

Rate limiting where appropriate

Secure environment variables

Do not expose:

Admin credentials

API keys

Private storage URLs unnecessarily

Donor mobile numbers

UTRs

Payment screenshots

24. ADMIN SECURITY

There must be no public:

/admin

access without authentication.

Do not create a hardcoded admin password inside frontend JavaScript.

Use proper authentication.

25. TRANSPARENCY PAGE

Create a public:

TRANSPARENCY

page.

Include:

VEGANFARM is currently an independent, unregistered animal-welfare movement. Donations collected through this platform are intended for the specific animal/case shown on the relevant campaign page. Relevant bills, receipts, and rescue/treatment updates may be provided as available.

Include a section for:

CASE UPDATES

Administrators can post:

Rescue update

Treatment update

Surgery update

Recovery update

Closure update

Each update should have:

Date

Title

Description

Optional image

Do not fabricate updates.

26. CASE EXPENSE TRANSPARENCY

For every case, allow the administrator to optionally add verified expense records.

Example:

Veterinary Consultation — ₹[amount]

Medicines — ₹[amount]

Treatment — ₹[amount]

Hospitalization — ₹[amount]

Other Approved Expense — ₹[amount]

Do not invent expenses.

The admin enters them.

If enabled, display them publicly under:

FUND UTILIZATION

27. MOBILE DESIGN

This is extremely important.

The majority of users may access the page through a phone.

Make everything mobile-friendly:

Large buttons

Large QR code

Large inputs

No horizontal scrolling

Easy image viewing

Sticky donation CTA only if it improves usability

Fast loading

Simple navigation

Clear spacing

The donation form should be easy to complete with one hand.

28. DESKTOP DESIGN

On desktop:

Use a professional centered max-width layout.

Use cards and two-column sections where appropriate.

The page should look like a real modern fundraising platform.

29. BRAND DESIGN

Use the uploaded VEGANFARM logo.

Suggested visual direction:

White

Soft off-white

Natural green

Dark charcoal

Very subtle neutral borders

Avoid overly bright colors.

Use green primarily for:

Branding

Primary CTA

Progress

Success states

Use red only for errors or destructive actions.

30. TYPOGRAPHY

Use a modern, highly readable sans-serif font.

Use strong hierarchy:

Large:

HELP SAVE A LIFE

Medium:

SUPPORT THIS ANIMAL

Small:

Supporting information.

Never make important information tiny.

31. TRUST ELEMENTS

Create trust through factual information:

Specific case information

Specific fundraising target

Case updates

Medical documentation where available

Donation verification status

Transparent funding calculations

Transparency statement

Clear organizational status

Do NOT create fake:

Reviews

Testimonials

Donor counters

"Trusted by thousands" claims

NGO badges

Government badges

Certification badges

32. PERFORMANCE

Optimize for:

Fast mobile loading

Compressed images

Lazy loading

Responsive images

Minimal unnecessary JavaScript

Good accessibility

Good SEO

33. SEO

Each rescue case should have dynamic:

Page title

Meta description

Open Graph image

Social sharing title

Social sharing description

Example title:

Help [Animal Name] — VEGANFARM Animal Rescue

Do not create false claims in SEO metadata.

34. SOCIAL SHARING

Each case should have a simple:

SHARE THIS CASE

button.

Support:

WhatsApp

Copy Link

Native mobile share

The shared message should contain the actual case name and URL.

Do not spam users.

35. EMPTY STATES

If information has not yet been added:

Do not invent information.

Show:

Information will be updated soon.

For missing images:

Case image not available

For missing amounts:

Funding information will be updated soon.

36. ERROR HANDLING

Create professional error messages.

Examples:

Please enter your name.

Please enter a valid mobile number.

Please enter a valid donation amount.

Please enter your payment reference.

Please upload your payment screenshot.

Something went wrong. Please try again.

Do not expose technical errors to normal users.

37. DATA INTEGRITY

Never allow:

Negative donations

Zero donations

Invalid UTR

Duplicate donation reference IDs

Negative remaining amount

Funding percentage above 100%

Unauthorized admin edits

Use server-side validation in addition to client-side validation wherever possible.

38. IMPORTANT LEGAL / ORGANIZATIONAL LANGUAGE

Always use:

VEGANFARM — Independent Animal-Welfare Movement

when describing organizational status.

Do NOT write:

"VEGANFARM NGO"

"Registered NGO"

"Registered charity"

"80G certified"

"Tax deductible"

unless those facts are explicitly provided and verified.

39. FUTURE PAYMENT INTEGRATION

Architect the application so that a real payment gateway can be integrated later.

Do not pretend that QR payments are automatically verified.

The current workflow is:

Scan QR → Make payment → Return → Submit amount + UTR + screenshot → Admin verifies → Verified donation contributes to campaign total

Later, a legitimate payment gateway can replace or supplement this workflow.

40. FINAL PAGE EXPERIENCE

The donor journey should feel like:

STEP 1

See the animal.

↓

STEP 2

Understand the rescue case.

↓

STEP 3

See the exact funding requirement.

↓

STEP 4

Scan the real VEGANFARM QR code.

↓

STEP 5

Make any donation amount.

↓

STEP 6

Submit UTR + payment screenshot.

↓

STEP 7

Receive donation reference.

↓

STEP 8

Donation waits for verification.

↓

STEP 9

After admin verification, the verified amount updates the case automatically.

41. FINAL QUALITY CHECK

Before considering the project complete, test:

Public website

Homepage

Rescue case listing

Individual rescue case

Images

QR code

Donation amount

Form

Validation

Submission

Success screen

Transparency page

Mobile layout

Desktop layout

Admin

Login

Dashboard

Create case

Edit case

Upload images

Upload QR

Set target

View donations

Verify donation

Reject donation

Case updates

Expense records

Calculations

Verify:

Amount Remaining = Required - Verified Raised

Verify:

Progress = Verified Raised / Required × 100

Verify that:

Pending donations do NOT increase verified fundraising totals.

Verify that:

Rejected donations do NOT increase fundraising totals.

42. MOST IMPORTANT REQUIREMENT

Do not merely create a beautiful frontend.

Build the actual working application architecture.

I want:

REAL WEBSITE + REAL DATABASE + REAL ADMIN DASHBOARD + REAL CASE MANAGEMENT + REAL DONATION SUBMISSIONS + REAL FILE STORAGE + REAL VERIFICATION WORKFLOW + REAL AUTOMATIC FUND CALCULATIONS.

Use the actual VEGANFARM logo and actual QR code attached to this prompt.

Do not invent either asset.

The final product should be something that can realistically be deployed as the VEGANFARM animal rescue fundraising platform after the required production configuration, domain, authentication, storage, and payment setup are completed.

Build it professionally from the beginning so that it does not need to be redesigned later.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://veganfarmmovement.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2e14193-960b-42bf-9a73-03ca2f0a7bc2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
