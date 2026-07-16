# Stedi for Revenue Cycle Management

Site: [stedi.com](https://stedi.com) 
### A top-down overview for the Classroom Clinic RCM group

_Purpose: This document explains what Stedi actually is, where it sits in the revenue cycle, which parts of our RCM operation it can cover, which parts it cannot, and how that maps onto our plan to extend the EMR while keeping some management work in the Stedi portal._



---

## 1. Executive Summary

Stedi is a modern, API-first **healthcare clearinghouse**. It is the pipe between your practice and your payers: you send it eligibility checks and claims, it routes them to the right payer, and it returns the payer's responses (acknowledgments, claim status, and remittance) in clean JSON. It is not a billing system, not a coding engine, and not a credentialing service. It replaces the EDI transaction layer of RCM (the 270/271, 837, 277, 276/277, 835 exchanges) and gives you a portal and APIs on top. Everything upstream of a claim (turning a clinical note into coded charges) and everything downstream of a remittance (posting to your ledger, patient statements, collections) stays your responsibility, in your EMR. See the [Stedi developer docs](https://www.stedi.com/docs/healthcare) and [About Stedi](https://www.stedi.com/docs/providers/providers-about-stedi).

---

## 2. Where Stedi sits in our world

We are effectively building the "vendor software" in Stedi's model, since your EMR will talk to Stedi's API on the backend and your RCM team will work primarily inside your own interface. Stedi describes this exact pattern (an EHR building eligibility and claims directly into its own UI) in its [integrated accounts overview](https://www.stedi.com/docs/healthcare/integrated-account-overview).

```mermaid
flowchart LR
    subgraph CC["Classroom Clinic"]
        RCMteam["RCM team"]
        EMR["EMR + RCM tooling<br/>(your Claude Code build)"]
    end
    subgraph STEDI["Stedi clearinghouse"]
        API["JSON / X12 APIs<br/>SFTP · webhooks · MCP"]
        Portal["Stedi portal UI"]
    end
    subgraph PAYERS["Payers"]
        P1["Commercial"]
        P2["Medicare / Medicaid"]
        P3["Dental / other"]
    end

    RCMteam --> EMR
    RCMteam -.->|"ad hoc / management"| Portal
    EMR <-->|"day-to-day transactions"| API
    Portal <--> API
    API <--> P1
    API <--> P2
    API <--> P3
```


Stedi is HIPAA, SOC 2 Type II, and HITRUST certified and will sign a BAA, which matters for this architecture. Those attestations are on the [Stedi Trust Center](https://trust.stedi.com/) and referenced from the [pricing page](https://www.stedi.com/pricing).

---

## 3. The enrollment trap: three different things, only one of which Stedi does

This is the single most important thing to get right, and it directly corrects a common assumption (including the one in your brief that credentialing "happens in their portal"). There are three distinct processes, and Stedi only handles the last one. This is laid out in Stedi's [credentialing and enrollment](https://www.stedi.com/docs/healthcare/credentialing-and-enrollment) page.

|Process|What it is|Typical timeline|Who does it|
|---|---|---|---|
|**Credentialing**|Validating a provider's qualifications (licensure, education, board certs, malpractice history) so they can join payer networks|90 to 180 days|**Not Stedi.** Direct with each payer, or a service like [Assured](https://www.withassured.com/), [Medallion](https://medallion.co/), or [Verifiable](https://verifiable.com/)|
|**Payer enrollment**|Registering a credentialed provider with a specific payer's plans, contracts, and reimbursement rates|60 to 120 days|**Not Stedi.** Direct with each payer (often bundled with credentialing)|
|**Transaction enrollment**|Registering a provider to exchange specific EDI transactions (claims, ERAs, eligibility) with a payer _through Stedi_|2 to 6 weeks|**Stedi**, via the [Enrollments API](https://www.stedi.com/docs/healthcare/api-reference/post-enrollment-create-enrollment) or the portal|

Key operational facts about transaction enrollment:

- It is **always required for 835 ERAs**, because a payer can only route ERAs to one clearinghouse at a time. Enrolling ERAs in Stedi overrides your prior clearinghouse's routing.
- It is **only sometimes required** for claims and eligibility, depending on the payer. Check the [Payer Network](https://www.stedi.com/healthcare/network) per payer per transaction type.
- It is **clearinghouse-specific**: if you migrate from another clearinghouse, you re-enroll through Stedi even for payers you were already live with elsewhere.

**Takeaway for your portal-vs-EMR split:** credentialing and payer enrollment are not a Stedi decision at all, they need a separate track (a credentialing vendor or in-house team). Transaction enrollment is genuinely a good candidate to keep in the Stedi portal, at least initially, because it is low-frequency, form-and-document heavy, and Stedi manages the back-and-forth with the payer for you. More on this in Section 8.

---

## 4. Stedi's capability catalog

Here is the full menu, grouped. Everything below is something Stedi actually does today.
### Eligibility and benefits

- **Real-time eligibility checks (270/271)** verify a patient's coverage with a known payer and return full benefits (copays, deductibles, out-of-pocket max). [Overview](https://www.stedi.com/docs/healthcare/eligibility-workflows-overview).
- **Batch eligibility** refreshes many patients at once. [Batch checks](https://www.stedi.com/docs/healthcare/batch-refresh-eligibility-checks).
- **Insurance discovery** finds active coverage from demographics alone when you do not know the payer or the patient cannot provide a card. It runs 13 to 16 eligibility checks under the hood, can take up to 120 seconds, and is meant as a backup, not your primary verification method. [Insurance discovery](https://www.stedi.com/docs/healthcare/insurance-discovery).
- **MBI lookup** finds a Medicare patient's Beneficiary Identifier from demographics. [MBI lookup](https://www.stedi.com/docs/healthcare/mbi-lookup).
- **Coordination of benefits (COB)** determines which of multiple plans pays first. [COB](https://www.stedi.com/docs/healthcare/coordination-of-benefits).

### Claims processing

- **Claim submission** in JSON or X12 for [professional (837P)](https://www.stedi.com/docs/healthcare/submit-professional-claims), [institutional (837I)](https://www.stedi.com/docs/healthcare/submit-institutional-claims), and [dental (837D)](https://www.stedi.com/docs/healthcare/submit-dental-claims), plus [workers' comp and auto](https://www.stedi.com/docs/healthcare/submit-workers-comp-auto-liability-claims). You send JSON, Stedi translates to X12 HIPAA. [Submission overview](https://www.stedi.com/docs/healthcare/intro-to-claim-submission).
- **Claim edits and repairs**: before forwarding, Stedi scrubs claims against a growing library of edits and returns rejections in real time so you can fix and resubmit. [Edits and repairs](https://www.stedi.com/docs/healthcare/claim-edits-and-repairs).
- **277CA acknowledgments** tell you whether a claim was accepted or rejected at each hop. [Acknowledgments overview](https://www.stedi.com/docs/healthcare/claim-responses-overview).
- **Real-time claim status (276/277)** checks where an accepted claim is in adjudication. [Check claim status](https://www.stedi.com/docs/healthcare/check-claim-status).
- **835 Electronic Remittance Advice** returns payment and adjustment/denial detail once the payer adjudicates. [ERAs](https://www.stedi.com/docs/healthcare/receive-claim-responses).
- **Resubmit or cancel** rejected or incorrect claims. [Resubmit / cancel](https://www.stedi.com/docs/healthcare/resubmit-cancel-claims).
- **Claim attachments (275)** for medical records, treatment plans, etc. [Attachments](https://www.stedi.com/docs/healthcare/submit-claim-attachments).
- **Paper claims**: for payers without electronic support, Stedi prints and mails CMS-1500 / UB-04. [Paper claims](https://www.stedi.com/docs/healthcare/submit-paper-claims).

### Platform and tooling

- **Payer Network** directory, searchable and programmatic, with per-payer enrollment requirements. [Payer Network](https://www.stedi.com/healthcare/network).
- **Webhooks / event destinations** to get pushed events for new 277CAs and 835s instead of polling. [Webhooks](https://www.stedi.com/docs/healthcare/configure-webhooks).
- **MCP server and Stedi Agent** for AI-driven workflows and troubleshooting, and it explicitly works with Claude Code. [MCP server](https://www.stedi.com/docs/healthcare/mcp-server), [Build with AI](https://www.stedi.com/docs/healthcare/build-with-ai).
- **Portal views and PDFs**: claims view, eligibility views, and generated CMS-1500 / ERA / eligibility PDFs. [Claims view](https://www.stedi.com/docs/healthcare/claims-view).

---

## 5. The revenue cycle, stage by stage, with Stedi's coverage

This is the centerpiece. The standard RCM cycle has roughly 14 stages. Below, each is colored by how much Stedi covers it.

| #   | RCM stage                              | Stedi Handles                                      | CC Staff / EMR Handles                                                                                                          |
| --- | -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Credentialing & payer enrollment       | Nothing                                            | RCM staff handles                                                                                                               |
| 1   | Scheduling & pre-registration          | Nothing                                            | EMR scheduling                                                                                                                  |
| 2   | Patient intake / registration          | Nothing directly                                   | EMR intake forms.  Collect patient insurance information.                                                                       |
| 3   | Eligibility & benefits verification    | 270/271, batch, insurance discovery, MBI, COB      | EMR UI and background processes to trigger and display results.  We will run check in the background for upcoming appointments. |
| 4   | Charge capture (note to charges)       | Nothing                                            | EMR: Providers collect in notes and turn into claims when submitted to billing.                                                 |
| 5   | Medical coding (CPT / ICD / modifiers) | Nothing (edits catch some errors later)            | CC EMR does this based upon the note details with diagnosis and CPT codes added.                                                |
| 6   | Claim generation & scrubbing           | Claim edits, real-time rejection feedback          | EMR builds the 837 payload from your data                                                                                       |
| 7   | Claim submission to payer              | 837P/I/D submission and routing                    | EMR to call the API                                                                                                             |
| 8   | Clearinghouse acknowledgment           | 277CA accept/reject at each stage                  | EMR to ingest and display                                                                                                       |
| 9   | Payer adjudication                     | (Stedi relays only)                                | Nothing you can build                                                                                                           |
| 10  | Remittance (835 ERA)                   | 835 ERA in JSON via webhook/poll                   | EMR to interpret it                                                                                                             |
| 11  | Payment posting to AR                  | The 835 data                                       | EMR logic to post payments/adjustments to your ledger                                                                           |
| 12  | Denial & appeal management             | Denial reason codes, claim status, resubmit/cancel | EMR worklists, appeal tracking, root-cause analytics                                                                            |
| 13  | Patient statements & collections       | Nothing                                            | Patient billing / statements / payments solution                                                                                |
| 14  | AR follow-up & reporting               | Operational claims/eligibility views               | EMR dashboards, KPI/AR analytics                                                                                                |


---

## 6. What a claim actually does, end to end

This is the technical loop your EMR will automate. It is the same loop regardless of the submission path used.

```mermaid
sequenceDiagram
    participant EMR as Classroom Clinic EMR
    participant Stedi
    participant Payer

    Note over EMR: Note becomes coded charges (your logic)
    EMR->>Stedi: Submit 837P claim (JSON)
    Stedi->>Stedi: Run claim edits / scrub
    alt Fails edits
        Stedi-->>EMR: Rejection with reasons
        EMR->>EMR: Fix data, resubmit
    else Passes edits
        Stedi->>Payer: Forward claim (X12 HIPAA)
        Stedi-->>EMR: 277CA (accepted)
        Payer->>Payer: Adjudicate
        Payer-->>Stedi: 835 ERA
        Stedi-->>EMR: 835 ERA (webhook or poll)
        EMR->>EMR: Post payment / adjustments to AR
        opt No remittance in expected window
            EMR->>Stedi: 276 claim status check
            Stedi-->>EMR: 277 status
        end
    end
```

Reference implementation steps are documented in the [claims processing overview](https://www.stedi.com/docs/healthcare/claims-processing-workflows-overview#example-api-implementation).

---

## 7. Your architecture: EMR +  Stedi

Your concept is sound and aligns with how Stedi expects modern builders to work. A few grounding facts for the build:

- **Claims and eligibility are JSON in, JSON out.** Stedi translates JSON to X12 HIPAA and back, so your team never has to hand-write X12. [Submission overview](https://www.stedi.com/docs/healthcare/intro-to-claim-submission).
- **Build against test mode first.** Free sandbox accounts and test API keys let you develop with mock eligibility responses and test claims (submit to test payer ID `STEDI` to get test ERAs in minutes) without touching PHI or real payers. This is ideal for a Claude Code loop. [Build with AI](https://www.stedi.com/docs/healthcare/build-with-ai), [Test claims workflow](https://www.stedi.com/docs/healthcare/test-claims-workflow).
- **Use events, not just polling.** Configure [webhooks / event destinations](https://www.stedi.com/docs/healthcare/configure-webhooks) so your EMR is notified when new 277CAs and 835s land, rather than polling on a timer.
- **Consider the MCP server for AI-assisted RCM features.** Stedi's [MCP server](https://www.stedi.com/docs/healthcare/mcp-server) is aimed at exactly your use case (RCM workflow agents that validate coverage), and it works with Claude Code. Useful if you want in-product AI helpers for your RCM team, distinct from using Claude Code to build the integration.
- **BAA before production PHI.** Sandbox/test work needs no PHI, but sign the [BAA](https://legal.stedi.com/legal/baa-4a521009) before any real patient data flows.

---

## 8. Portal vs EMR: a concrete recommendation

Your instinct (keep management-type work in the portal, put daily work in the EMR) is right. Here is the refined split, with the credentialing correction folded in.

|Build in our EMR — daily RCM work|Keep in Stedi portal — low-frequency / management|Outside Stedi — separate track|
|---|---|---|
|Claim submission from notes|Transaction enrollment & tasks|Credentialing|
|Claim tracking & status dashboard|Payer Network lookup|Payer enrollment|
|ERA-driven payment posting|Raw transaction & rejection troubleshooting|Patient statements & collections|
|Denial & appeal worklists|Ad hoc claim status / eligibility||
|Eligibility at intake / batch|Stedi Agent assistance||
|RCM KPI & AR reporting|||

### Rationale, item by item

**Keep in the Stedi portal (at least at first):**

- **Transaction enrollment.** Form-heavy, document-heavy, low-volume, and Stedi drives the payer back-and-forth. The portal already handles enrollment tasks and PDF documents well. You can move this into the EMR later via the free [Enrollments API](https://www.stedi.com/docs/healthcare/api-reference/post-enrollment-create-enrollment) if volume justifies it, but there is no rush.
- **Payer Network lookup.** Great as a reference tool; no reason to rebuild it.
- **Troubleshooting and raw transaction inspection.** When a claim behaves strangely, the portal shows the raw X12 and full response detail that you probably will not surface in your own UI.
- **Ad hoc checks and Stedi Agent.** A convenient fallback for one-off eligibility or claim-status lookups and AI-assisted error recovery.

**Build in the EMR (the daily grind for your RCM team):**

- **Claim submission from notes.** Generate and submit claims straight from encounter notes.
- **Claim tracking & status.** A dashboard where RCM staff watch claims move through each stage.
- **ERA-driven payment posting.** Post payments and adjustments automatically off incoming 835s.
- **Denial & appeal worklists.** Queue, assign, and track denials through to resolution.
- **Eligibility at intake.** Real-time and batch coverage checks surfaced right in the intake flow.
- **RCM KPI & AR reporting.** Days-in-AR, clean-claim rate, denial rate, and net collection analytics.

This is your core value: a single interface where RCM staff live all day, backed by Stedi transactions.

**Route outside Stedi entirely:**

- **Credentialing and payer enrollment** to a dedicated service or in-house team.
- **Patient statements and collections** to a patient-billing/payments solution, since Stedi is payer-facing only.


## Open Questions

* If we submit to payer and there is a secondary payer involved, how will that be processed?

---

## 9. Suggested phasing

1. **Prove the loop in sandbox.** Stand up a Stedi sandbox account, generate test keys, and use Claude Code with `llms-full.txt` + the OpenAPI specs to build eligibility check → claim submit → 277CA → 835 against test payers. No PHI, no BAA needed yet.
2. **Wire real-time eligibility into intake first.** It is the lowest-risk, highest-daily-value transaction and gives your team an immediate win.
3. **Sign the BAA, upgrade to production, and start transaction enrollment** (in the portal) for your top payers, prioritizing ERA enrollment since it is always required.
4. **Go live on professional claim submission** for one or two payers, then expand as enrollments complete.
5. **Build ERA ingestion and posting**, then layer denial worklists and reporting on top of the data you are now collecting.
6. **Revisit the portal-vs-EMR line** once volume is known: move transaction enrollment into the EMR via API only if the manual portal process becomes a bottleneck.

---

## 10. Reference links

**Core Stedi docs:**
- [Stedi developer docs (home)](https://www.stedi.com/docs/healthcare)
- [Credentialing and enrollment](https://www.stedi.com/docs/healthcare/credentialing-and-enrollment)
- [Eligibility overview](https://www.stedi.com/docs/healthcare/eligibility-workflows-overview)
- [Insurance discovery](https://www.stedi.com/docs/healthcare/insurance-discovery)
- [Claims processing overview](https://www.stedi.com/docs/healthcare/claims-processing-workflows-overview)
- [Claim submission intro](https://www.stedi.com/docs/healthcare/intro-to-claim-submission)
- [Claim edits and repairs](https://www.stedi.com/docs/healthcare/claim-edits-and-repairs)
- [Acknowledgments and ERAs](https://www.stedi.com/docs/healthcare/claim-responses-overview)
- [Check claim status](https://www.stedi.com/docs/healthcare/check-claim-status)
- [Build with AI](https://www.stedi.com/docs/healthcare/build-with-ai)
- [MCP server](https://www.stedi.com/docs/healthcare/mcp-server)
- [Webhooks](https://www.stedi.com/docs/healthcare/configure-webhooks)
- [Integrated accounts](https://www.stedi.com/docs/healthcare/integrated-account-overview)
- [Payer Network](https://www.stedi.com/healthcare/network)
- [Pricing](https://www.stedi.com/pricing)

**LLM reference (for your Claude Code agents):**
- [Docs index for LLMs (llms.txt)](https://www.stedi.com/docs/llms.txt)
- [Full docs (llms-full.txt)](https://www.stedi.com/docs/llms-full.txt)
